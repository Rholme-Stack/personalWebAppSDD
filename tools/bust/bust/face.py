"""Stage 5: face features (eyes, brows, nose, lips, jaw) from MediaPipe Face Landmarker.

The landmarks of the front photo give the position of each feature on the bust; their depth
comes from the median of the frontal video frames, which are sharper. The face surface built from
them replaces the smooth front of the carved head, so the eye sockets, nose and lips show.
"""

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision

from . import Context
from .hull import FRONT_PHOTO
from .segment import download

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/"
    "face_landmarker/float16/latest/face_landmarker.task"
)
NOSE_TIP, CHIN = 1, 152
EYE_OUTER = (33, 263)
FRONTAL_DEGREES = 12  # frames whose head turns less than this count as frontal
SURFACE_SPACING = 0.7  # voxels between points of the face surface
LINE_SPACING = 0.5  # voxels between points of a feature line
_C = vision.FaceLandmarksConnections
FEATURE_LINES = [
    _C.FACE_LANDMARKS_LEFT_EYE,
    _C.FACE_LANDMARKS_RIGHT_EYE,
    _C.FACE_LANDMARKS_LEFT_EYEBROW,
    _C.FACE_LANDMARKS_RIGHT_EYEBROW,
    _C.FACE_LANDMARKS_LIPS,
    _C.FACE_LANDMARKS_NOSE,
    _C.FACE_LANDMARKS_FACE_OVAL,
]
# Converts directions from MediaPipe's camera (y up, z toward the viewer) to COLMAP's (y down, z ahead).
GL_TO_CV = np.diag([1.0, -1.0, -1.0])


class Landmarker:
    def __init__(self, ctx: Context):
        options = vision.FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=str(download(MODEL_URL, ctx.models_dir))),
            output_facial_transformation_matrixes=True,
            num_faces=1,
        )
        self._landmarker = vision.FaceLandmarker.create_from_options(options)

    def detect(self, bgr: np.ndarray) -> tuple[np.ndarray, np.ndarray] | None:
        """Landmarks in pixels (x, y, z with z in pixels, smaller = closer) and the 4x4 head pose
        (canonical face -> camera, MediaPipe/OpenGL axes). None when no face is found."""
        rgb = np.ascontiguousarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        result = self._landmarker.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
        if not result.face_landmarks:
            return None
        height, width = bgr.shape[:2]
        points = np.array([[p.x * width, p.y * height, p.z * width] for p in result.face_landmarks[0]])
        return points, np.array(result.facial_transformation_matrixes[0])

    def close(self) -> None:
        self._landmarker.close()


def turn_degrees(pose: np.ndarray) -> float:
    """How far the face is from looking straight at the camera."""
    forward = pose[:3, 2]
    return float(np.degrees(np.arccos(np.clip(forward[2], -1, 1))))


def relief(ctx: Context, landmarker: Landmarker) -> np.ndarray | None:
    """Depth of each landmark (toward the viewer = positive), in inter-ocular distances: median of
    the frontal video frames."""
    reliefs = []
    for path in sorted(ctx.frames_dir.glob("frame_*.jpg")):
        found = landmarker.detect(cv2.imread(str(path)))
        if found is None or turn_degrees(found[1]) > FRONTAL_DEGREES:
            continue
        points = found[0]
        eyes = np.linalg.norm(points[EYE_OUTER[0], :2] - points[EYE_OUTER[1], :2])
        reliefs.append(-(points[:, 2] - points[NOSE_TIP, 2]) / eyes)
    print(f"   fotogramas frontales para la profundidad: {len(reliefs)}")
    return np.median(reliefs, axis=0) if reliefs else None


def front_z(occupied: np.ndarray, half: int, x: float, y: float) -> float:
    """Volume z of the front surface of the carved bust at (x, y)."""
    column = occupied[int(round(y)), int(round(x)) + half]
    zs = np.nonzero(column)[0]
    return float(zs.max() - half) if zs.size else 0.0


def run(ctx: Context) -> None:
    hull = np.load(ctx.work / "hull.npz")
    occupied, half, scale = hull["occupied"], int(hull["half"]), int(hull["scale"])
    landmarker = Landmarker(ctx)
    try:
        front = landmarker.detect(cv2.imread(str(ctx.photo_paths()[FRONT_PHOTO])))
        if front is None:
            raise RuntimeError("No se encuentra la cara en la foto de frente.")
        depth = relief(ctx, landmarker)
    finally:
        landmarker.close()

    # Front photo pixels -> volume coordinates (the front photo has angle 0).
    points, _ = front
    x = points[:, 0] / scale - hull["axes"][FRONT_PHOTO]
    y = points[:, 1] / scale - hull["tops"][FRONT_PHOTO]
    eyes = np.hypot(x[EYE_OUTER[0]] - x[EYE_OUTER[1]], y[EYE_OUTER[0]] - y[EYE_OUTER[1]])
    if depth is None:
        depth = -(points[:, 2] - points[NOSE_TIP, 2]) / (eyes * scale)
    z = depth * eyes + front_z(occupied, half, x[NOSE_TIP], y[NOSE_TIP])
    # Stay inside the carved bust: the hull is the largest shape that fits every photo.
    z = np.array([min(zi, front_z(occupied, half, xi, yi)) for xi, yi, zi in zip(x, y, z)])
    landmarks = np.stack([x, y, z], axis=1)

    surface, normals = face_surface(landmarks)
    features = feature_lines(landmarks)
    oval = landmarks[[c.start for c in _C.FACE_LANDMARKS_FACE_OVAL], :2]
    np.savez_compressed(
        ctx.work / "face.npz",
        landmarks=landmarks,
        surface=surface,
        normals=normals,
        features=features,
        oval=oval,
    )
    print(f"   {len(surface)} puntos de superficie y {len(features)} de rasgos en la cara")


def face_surface(landmarks: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Dense points on the triangulated face (Delaunay of the landmarks seen from the front)."""
    xy = landmarks[:, :2]
    lo, hi = xy.min(axis=0) - 1, xy.max(axis=0) + 1
    subdiv = cv2.Subdiv2D((int(lo[0]) - 1, int(lo[1]) - 1, int(hi[0] - lo[0]) + 3, int(hi[1] - lo[1]) + 3))
    for point in xy:
        subdiv.insert((float(point[0]), float(point[1])))
    points, normals = [], []
    for t in subdiv.getTriangleList():
        # Subdiv2D returns float32 corners (and its own outer corners): match them to landmarks.
        corners = [int(np.argmin(np.hypot(*(xy - t[k : k + 2]).T))) for k in (0, 2, 4)]
        if any(np.hypot(*(xy[c] - t[k : k + 2])) > 0.01 for c, k in zip(corners, (0, 2, 4))):
            continue
        a, b, c = landmarks[corners]
        normal = np.cross(b - a, c - a)
        if np.linalg.norm(normal) == 0:
            continue
        normal = normal / np.linalg.norm(normal)
        if normal[2] < 0:
            normal = -normal
        steps = max(2, int(max(np.linalg.norm(b - a), np.linalg.norm(c - a)) / SURFACE_SPACING))
        for i in range(steps + 1):
            for j in range(steps + 1 - i):
                points.append(a + (b - a) * i / steps + (c - a) * j / steps)
                normals.append(normal)
    return np.array(points), np.array(normals)


def feature_lines(landmarks: np.ndarray) -> np.ndarray:
    points = []
    for connections in FEATURE_LINES:
        for c in connections:
            a, b = landmarks[c.start], landmarks[c.end]
            steps = max(1, int(np.linalg.norm(b - a) / LINE_SPACING))
            points.extend(a + (b - a) * t for t in np.linspace(0, 1, steps + 1))
    return np.array(points)
