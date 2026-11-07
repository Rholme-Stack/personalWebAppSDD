"""Stage 4: a more precise head from the selfie video.

pycolmap finds where the phone was for each frame, using only the head (the background is masked
out, because in a selfie the body and background move with the arm). With those cameras the head
is carved again from 200+ views. It is then placed in the photo volume with the face: Face
Landmarker gives which way the head looks and where the eyes and nose tip are, both in the video
(triangulated with the cameras) and in the front photo. The video head then refines the upper part
of the photo head; the jaw, neck and shoulders stay as in the photos.

If too few frames are registered, the photo hull is kept as it is.
"""

import shutil
from pathlib import Path

import cv2
import numpy as np
import pycolmap

from . import Context, ensure_dir
from .face import EYE_OUTER, GL_TO_CV, NOSE_TIP, Landmarker, front_z, turn_degrees
from .hull import FRONT_PHOTO

MIN_REGISTERED = 0.6
MASK_ERODE_PX = 6  # keep features away from the head outline, where the background shows
GRID = 160
VOTE = 0.95  # a voxel stays if it is inside the person in 95 % of the frames that see it
MIN_VIEWS = 10
TRIANGULATION_DEGREES = 35  # frames used to locate the eyes and nose tip
REFINE_ROWS = 0.8  # the video refines the head down to 0.8 head heights (above the jaw)
ROTATION_STEPS = np.radians([-4, -2, 2, 4])
SHIFT_STEPS = [-2, -1, 1, 2]
SCALE_STEPS = [0.97, 0.985, 1.015, 1.03]


def sfm_dir(ctx: Context) -> Path:
    return ctx.work / "sfm"


def reconstruct(ctx: Context) -> pycolmap.Reconstruction | None:
    root = ensure_dir(sfm_dir(ctx))
    masks = ensure_dir(root / "masks", clean=True)
    kernel = np.ones((MASK_ERODE_PX * 2 + 1,) * 2, np.uint8)
    for frame in sorted(ctx.frames_dir.glob("frame_*.jpg")):
        head = cv2.imread(str(ctx.masks_dir / f"{frame.stem}.png"), cv2.IMREAD_GRAYSCALE)
        cv2.imwrite(str(masks / f"{frame.name}.png"), cv2.erode(head, kernel))

    database = root / "database.db"
    database.unlink(missing_ok=True)
    shutil.rmtree(root / "sparse", ignore_errors=True)

    reader = pycolmap.ImageReaderOptions()
    reader.mask_path = str(masks)
    reader.camera_model = "SIMPLE_RADIAL"
    extraction = pycolmap.FeatureExtractionOptions()
    extraction.use_gpu = False
    extraction.sift.max_num_features = 4096
    pycolmap.extract_features(
        database, ctx.frames_dir, camera_mode=pycolmap.CameraMode.SINGLE, reader_options=reader, extraction_options=extraction
    )

    matching = pycolmap.FeatureMatchingOptions()
    matching.use_gpu = False
    pairing = pycolmap.SequentialPairingOptions()
    pairing.overlap = 12
    pairing.quadratic_overlap = True
    pycolmap.match_sequential(database, matching_options=matching, pairing_options=pairing)

    pycolmap.incremental_mapping(database, ctx.frames_dir, ensure_dir(root / "sparse"))
    return load_model(ctx)


def load_model(ctx: Context) -> pycolmap.Reconstruction | None:
    """The largest reconstruction found (the others are small loose fragments)."""
    models = [pycolmap.Reconstruction(str(d)) for d in (sfm_dir(ctx) / "sparse").iterdir() if d.is_dir()]
    return max(models, key=lambda m: m.num_reg_images(), default=None)


def cameras(model: pycolmap.Reconstruction) -> list[tuple[str, np.ndarray, np.ndarray, np.ndarray]]:
    """(frame name, R, t, [f, cx, cy, k]) of every registered frame; camera = R · world + t."""
    result = []
    for image_id in model.reg_image_ids():
        image = model.images[image_id]
        pose = image.cam_from_world().matrix()
        params = np.array(model.cameras[image.camera_id].params)
        result.append((image.name, pose[:, :3], pose[:, 3], params))
    return result


def carve(ctx: Context, model: pycolmap.Reconstruction):
    """Voxels inside the person in every frame, in world coordinates: (occupied, origin, voxel).

    The person mask (not only the head) is used: seen from below, the back of the head hides
    behind the neck, and a head-only mask would carve it away.
    """
    # The 3D points cluster on the face, where there is most detail: the box must be much larger
    # than them to keep the back of the head.
    xyz = np.array([p.xyz for p in model.points3D.values()])
    lo, hi = np.percentile(xyz, 2, axis=0), np.percentile(xyz, 98, axis=0)
    extent = float((hi - lo).max() * 2.4)
    voxel = extent / GRID
    origin = np.median(xyz, axis=0) - extent / 2
    idx = np.indices((GRID,) * 3).reshape(3, -1).T
    centers = (origin + (idx + 0.5) * voxel).astype(np.float32)

    seen = np.zeros(len(centers), np.int16)
    inside = np.zeros(len(centers), np.int16)
    for name, rotation, translation, (f, cx, cy, k) in cameras(model):
        mask = cv2.imread(str(ctx.masks_dir / f"{Path(name).stem}_person.png"), cv2.IMREAD_GRAYSCALE) > 127
        cam = centers @ rotation.T.astype(np.float32) + translation.astype(np.float32)
        z = cam[:, 2]
        front = z > 1e-3
        x = np.clip(cam[:, 0] / np.where(front, z, 1), -5, 5)
        y = np.clip(cam[:, 1] / np.where(front, z, 1), -5, 5)
        distortion = 1 + k * (x * x + y * y)
        u = (f * x * distortion + cx).astype(np.int32)
        v = (f * y * distortion + cy).astype(np.int32)
        visible = front & (u >= 0) & (u < mask.shape[1]) & (v >= 0) & (v < mask.shape[0])
        seen += visible
        inside += visible & mask[np.clip(v, 0, mask.shape[0] - 1), np.clip(u, 0, mask.shape[1] - 1)]
    occupied = (seen >= MIN_VIEWS) & (inside >= VOTE * seen)
    return occupied.reshape((GRID,) * 3), origin, voxel


def triangulate(observations: list[tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]]) -> np.ndarray:
    """World point seen at pixel uv by cameras (R, t, [f, cx, cy, k]): linear least squares."""
    rows = []
    for rotation, translation, (f, cx, cy, _), uv in observations:
        projection = np.hstack([rotation, translation[:, None]])
        x, y = (uv[0] - cx) / f, (uv[1] - cy) / f
        rows += [x * projection[2] - projection[0], y * projection[2] - projection[1]]
    _, _, vt = np.linalg.svd(np.array(rows))
    return vt[-1][:3] / vt[-1][3]


def face_in_world(ctx: Context, model: pycolmap.Reconstruction):
    """Head axes (columns: right, up, forward) and world positions of the nose tip and the eyes."""
    total = np.zeros((3, 3))
    observations: dict[int, list] = {NOSE_TIP: [], EYE_OUTER[0]: [], EYE_OUTER[1]: []}
    landmarker = Landmarker(ctx)
    try:
        for name, rotation, translation, params in cameras(model):
            detected = landmarker.detect(cv2.imread(str(ctx.frames_dir / name)))
            if detected is None:
                continue
            points, pose = detected
            total += rotation.T @ GL_TO_CV @ pose[:3, :3]
            if turn_degrees(pose) <= TRIANGULATION_DEGREES:
                for index, seen in observations.items():
                    seen.append((rotation, translation, params, points[index, :2]))
    finally:
        landmarker.close()
    u, _, vt = np.linalg.svd(total)
    axes = u @ vt
    if np.linalg.det(axes) < 0:
        axes = u @ np.diag([1, 1, -1]) @ vt
    print(f"   cara localizada en {len(observations[NOSE_TIP])} fotogramas casi frontales")
    return axes, {index: triangulate(seen) for index, seen in observations.items()}


def face_in_photo(ctx: Context, hull: dict) -> dict[int, np.ndarray]:
    """Volume positions of the nose tip and the eyes, from the front photo."""
    landmarker = Landmarker(ctx)
    try:
        detected = landmarker.detect(cv2.imread(str(ctx.photo_paths()[FRONT_PHOTO])))
    finally:
        landmarker.close()
    if detected is None:
        raise RuntimeError("No se encuentra la cara en la foto de frente.")
    points, _ = detected
    scale, half = int(hull["scale"]), int(hull["half"])
    result = {}
    for index in (NOSE_TIP, *EYE_OUTER):
        x = points[index, 0] / scale - hull["axes"][FRONT_PHOTO]
        y = points[index, 1] / scale - hull["tops"][FRONT_PHOTO]
        result[index] = np.array([x, y, front_z(hull["occupied"], half, x, y)])
    return result


class Fit:
    """Places the video head in the photo volume, with a small rotation, shift and scale around
    the nose tip. Each photo voxel looks up the video voxel at the same place, so there are no gaps.
    """

    def __init__(self, occupied, origin, voxel, axes, world_nose, scale, nose, photo: np.ndarray, half: int):
        self.video, self.origin, self.voxel = occupied, origin, voxel
        self.axes, self.world_nose, self.scale, self.nose = axes, world_nose, scale, nose
        self.photo, self.half = photo, half

    def centers(self, rows: int, step: int) -> np.ndarray:
        """Photo voxel centers (x, y, z volume coordinates) of the first rows, every step voxels."""
        y, x, z = np.mgrid[0:rows:step, 0 : self.photo.shape[1] : step, 0 : self.photo.shape[2] : step]
        return np.stack([x.ravel() - self.half, y.ravel(), z.ravel() - self.half], axis=1).astype(np.float32)

    def sample(self, points: np.ndarray, params: np.ndarray) -> np.ndarray:
        rx, ry, rz, tx, ty, tz, s = params
        local = ((points - self.nose - np.array([tx, ty, tz])) / s) @ _rotation(rx, ry, rz)
        local[:, 1] *= -1  # back to "up"
        world = self.world_nose + (local / self.scale) @ self.axes.T
        idx = np.floor((world - self.origin) / self.voxel).astype(int)
        inside = np.all((idx >= 0) & (idx < np.array(self.video.shape)), axis=1)
        values = np.zeros(len(points), bool)
        values[inside] = self.video[tuple(idx[inside].T)]
        return values

    def iou(self, params: np.ndarray, points: np.ndarray, truth: np.ndarray) -> float:
        values = self.sample(points, params)
        return float((values & truth).sum() / max(1, (values | truth).sum()))

    def grid(self, params: np.ndarray) -> np.ndarray:
        points = self.centers(self.photo.shape[0], 1)
        return self.sample(points, params).reshape(self.photo.shape)


def _rotation(rx: float, ry: float, rz: float) -> np.ndarray:
    cx, sx, cy, sy, cz, sz = np.cos(rx), np.sin(rx), np.cos(ry), np.sin(ry), np.cos(rz), np.sin(rz)
    rot_x = np.array([[1, 0, 0], [0, cx, -sx], [0, sx, cx]])
    rot_y = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]])
    rot_z = np.array([[cz, -sz, 0], [sz, cz, 0], [0, 0, 1]])
    return rot_z @ rot_y @ rot_x


def place(occupied, origin, voxel, axes, world, photo_face, photo: np.ndarray, half: int, head: float):
    """The video head inside the photo volume. Returns (grid, IoU with the photo head)."""
    eyes_world = np.linalg.norm(world[EYE_OUTER[0]] - world[EYE_OUTER[1]])
    eyes_photo = np.linalg.norm(photo_face[EYE_OUTER[0]][:2] - photo_face[EYE_OUTER[1]][:2])
    scale = eyes_photo / eyes_world
    nose = photo_face[NOSE_TIP]

    fit = Fit(occupied, origin, voxel, axes, world[NOSE_TIP], scale, nose, photo, half)
    rows = int(REFINE_ROWS * head)
    points = fit.centers(rows, 2)  # every other voxel is enough to compare shapes
    truth = photo[:rows:2, ::2, ::2].ravel()
    params = np.array([0, 0, 0, 0, 0, 0, 1.0])
    best = fit.iou(params, points, truth)
    print(f"   coincidencia inicial con la cabeza de las fotos (IoU): {best:.3f}")
    steps = [ROTATION_STEPS] * 3 + [SHIFT_STEPS] * 3 + [SCALE_STEPS]
    for _ in range(3):
        for i, deltas in enumerate(steps):
            for delta in deltas:
                trial = params.copy()
                trial[i] = trial[i] * delta if i == 6 else trial[i] + delta
                value = fit.iou(trial, points, truth)
                if value > best:
                    best, params = value, trial
    return fit.grid(params), best


def run(ctx: Context) -> None:
    frames = sorted(ctx.frames_dir.glob("frame_*.jpg"))
    model = reconstruct(ctx)
    registered = model.num_reg_images() if model else 0
    share = registered / len(frames)
    print(f"   fotogramas registrados: {registered} de {len(frames)} ({share:.0%})")
    if model is None or share < MIN_REGISTERED:
        print("   cabeza: la de las fotos (el vídeo no tiene bastantes fotogramas registrados)")
        shutil.copy(ctx.work / "hull_photos.npz", ctx.work / "hull.npz")
        return
    merge(ctx, model)


def merge(ctx: Context, model: pycolmap.Reconstruction) -> None:
    hull = dict(np.load(ctx.work / "hull_photos.npz"))
    photo, half, head = hull["occupied"], int(hull["half"]), float(hull["head"])
    occupied, origin, voxel = carve(ctx, model)
    axes, world = face_in_world(ctx, model)
    video, iou = place(occupied, origin, voxel, axes, world, face_in_photo(ctx, hull), photo, half, head)
    print(f"   coincidencia final con la cabeza de las fotos (IoU): {iou:.3f}")

    rows = int(REFINE_ROWS * head)
    merged = photo.copy()
    grown = np.stack([cv2.dilate(s.astype(np.uint8), np.ones((3, 3), np.uint8)) for s in video]) > 0
    merged[:rows] &= grown[:rows]
    hull["occupied"] = merged
    np.savez_compressed(ctx.work / "hull.npz", **hull)
    print("   cabeza: la del vídeo (hasta la mandíbula), sobre la silueta de las fotos")
    check_sheet(ctx, photo, video, merged)


def check_sheet(ctx: Context, photo: np.ndarray, video: np.ndarray, merged: np.ndarray) -> None:
    """Front, side and top silhouettes of the photo hull, the video head and the merged bust."""
    rows = []
    for volume in (photo, video, merged):
        views = [volume.any(axis=2), volume.any(axis=1), volume.any(axis=0).T]
        height = max(v.shape[0] for v in views)
        tiles = [np.pad(v, ((0, height - v.shape[0]), (0, 4))).astype(np.uint8) * 255 for v in views]
        rows.append(np.hstack(tiles))
    width = max(r.shape[1] for r in rows)
    sheet = np.vstack([np.pad(r, ((0, 4), (0, width - r.shape[1]))) for r in rows])
    cv2.imwrite(str(ensure_dir(ctx.work / "checks") / "video_head.png"), sheet)
