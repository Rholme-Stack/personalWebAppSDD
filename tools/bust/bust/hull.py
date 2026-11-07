"""Stage 3: visual hull of the bust from the 8 photos.

The camera stood still while Rodrigo turned ~45° between photos, so each photo is an
orthographic view of the same body rotated around a vertical axis. A voxel is kept only if it
falls inside the person's silhouette in every photo.

Volume coordinates (in downscaled photo pixels):
    y: rows down from the top of the head (0 = top of the head)
    x: to the viewer's right in the front photo
    z: toward the camera in the front photo
"""

from dataclasses import dataclass

import cv2
import numpy as np

from . import Context, ensure_dir
from .segment import FACE_SKIN

FRONT_PHOTO = 7  # ...150843.jpg faces the camera; the other photos go back in time 45° each
STEP_DEGREES = 45
SEARCH_SCALE = 12  # photos downscaled 12x while searching angles and axes
FINAL_SCALE = 6  # and 6x for the final volume
CUT_HEADS = 1.85  # the bust ends 1.85 head heights below the top of the head
ANGLE_STEPS = np.radians(np.arange(-10, 10.1, 2.5))
AXIS_STEPS = range(-3, 4)
SWEEPS = 3


@dataclass
class View:
    mask: np.ndarray  # bool, downscaled
    top: int  # row of the top of the head


def load_views(ctx: Context, scale: int) -> list[View]:
    views = []
    for i in range(len(ctx.photo_paths())):
        full = cv2.imread(str(ctx.masks_dir / f"photo_{i}.png"), cv2.IMREAD_GRAYSCALE)
        small = cv2.resize(full, (full.shape[1] // scale, full.shape[0] // scale), interpolation=cv2.INTER_AREA)
        mask = small > 127
        rows = np.nonzero(mask.sum(axis=1) >= 2)[0]
        views.append(View(mask=mask, top=int(rows[0])))
    return views


def head_height(ctx: Context, scale: int) -> float:
    """Top of the head to the chin, measured on the front photo."""
    labels = cv2.imread(str(ctx.masks_dir / f"photo_{FRONT_PHOTO}_labels.png"), cv2.IMREAD_GRAYSCALE)
    person = cv2.imread(str(ctx.masks_dir / f"photo_{FRONT_PHOTO}.png"), cv2.IMREAD_GRAYSCALE)
    face_rows = np.nonzero((labels == FACE_SKIN).any(axis=1))[0]
    top = np.nonzero((person > 127).any(axis=1))[0][0]
    return (face_rows.max() - top) / scale


def initial_axes(views: list[View], head: float) -> list[float]:
    """The turning axis is taken at the middle of the torso, at chest height."""
    axes = []
    for view in views:
        row = view.mask[min(view.mask.shape[0] - 1, view.top + int(1.5 * head))]
        cols = np.nonzero(row)[0]
        axes.append((cols.min() + cols.max()) / 2)
    return axes


def half_width(view: View, axis: float, height: int) -> float:
    """Largest horizontal distance from the axis to the silhouette, within the bust rows."""
    cols = np.nonzero(view.mask[view.top : view.top + height].any(axis=0))[0]
    return float(np.abs(cols - axis).max())


class Carver:
    def __init__(self, views: list[View], height: int, half: int):
        self.views = views
        self.height = height
        self.half = half
        coords = np.arange(-half, half + 1, dtype=np.float32)
        self.x, self.z = np.meshgrid(coords, coords, indexing="ij")
        self.rows = [self._rows(v) for v in views]

    def _rows(self, view: View) -> np.ndarray:
        rows = np.zeros((self.height, view.mask.shape[1]), bool)
        part = view.mask[view.top : view.top + self.height]
        rows[: part.shape[0]] = part
        return rows

    def columns(self, angle: float, axis: float, width: int) -> np.ndarray:
        u = np.rint(self.x * np.cos(angle) + self.z * np.sin(angle) + axis).astype(np.int32)
        return np.where((u >= 0) & (u < width), u, -1)

    def carve(self, angles, axes) -> np.ndarray:
        occupied = np.ones((self.height, *self.x.shape), bool)
        for rows, angle, axis in zip(self.rows, angles, axes):
            u = self.columns(angle, axis, rows.shape[1])
            occupied &= rows[:, np.maximum(u, 0)] & (u >= 0)
        return occupied

    def iou(self, occupied: np.ndarray, index: int, angle: float, axis: float) -> float:
        rows = self.rows[index]
        y, xi, zi = np.nonzero(occupied)
        u = self.columns(angle, axis, rows.shape[1])[xi, zi]
        projected = np.zeros_like(rows)
        projected[y[u >= 0], u[u >= 0]] = True
        union = (projected | rows).sum()
        return float((projected & rows).sum() / union) if union else 0.0

    def score(self, angles, axes) -> tuple[float, list[float]]:
        occupied = self.carve(angles, axes)
        ious = [self.iou(occupied, i, a, x) for i, (a, x) in enumerate(zip(angles, axes))]
        return float(np.mean(ious)), ious


def initial_angles(count: int, direction: int) -> list[float]:
    return [direction * np.radians((FRONT_PHOTO - i) * STEP_DEGREES) for i in range(count)]


def refine(carver: Carver, angles: list[float], axes: list[float]) -> tuple[list[float], list[float], float]:
    best, _ = carver.score(angles, axes)
    for _ in range(SWEEPS):
        for i in range(len(angles)):
            if i == FRONT_PHOTO:
                continue  # the front photo fixes the orientation of the volume
            base_angle, base_axis = angles[i], axes[i]
            for da in ANGLE_STEPS:
                for dx in AXIS_STEPS:
                    trial_angles = angles.copy()
                    trial_axes = axes.copy()
                    trial_angles[i] = base_angle + da
                    trial_axes[i] = base_axis + dx
                    value, _ = carver.score(trial_angles, trial_axes)
                    if value > best:
                        best, angles, axes = value, trial_angles, trial_axes
    return angles, axes, best


def face_forward(ctx: Context, views: list[View], angles, axes, head: float, scale: int) -> bool:
    """Silhouettes cannot tell a bust from its front-back mirror. In the profile photos the face
    skin must lie on the side the face looks to (+z): check it there."""
    votes = 0.0
    for i, (view, angle, axis) in enumerate(zip(views, angles, axes)):
        if abs(np.sin(angle)) < 0.7:
            continue
        full = cv2.imread(str(ctx.masks_dir / f"photo_{i}_labels.png"), cv2.IMREAD_GRAYSCALE)
        labels = cv2.resize(full, view.mask.shape[::-1], interpolation=cv2.INTER_NEAREST)
        head_rows = labels[view.top : view.top + int(head)]
        cols = np.nonzero(head_rows == FACE_SKIN)[1]
        if cols.size:
            votes += np.sign(cols.mean() - axis) * np.sign(np.sin(angle))
    return votes >= 0


def run(ctx: Context) -> None:
    views = load_views(ctx, SEARCH_SCALE)
    head = head_height(ctx, SEARCH_SCALE)
    height = int(round(CUT_HEADS * head))
    axes = initial_axes(views, head)
    half = int(1.1 * max(half_width(v, a, height) for v, a in zip(views, axes)))
    carver = Carver(views, height, half)

    # The turning direction is not known: keep the one whose silhouettes agree best.
    candidates = []
    for direction in (1, -1):
        angles = initial_angles(len(views), direction)
        candidates.append((carver.score(angles, axes)[0], angles))
    _, angles = max(candidates, key=lambda c: c[0])
    angles, axes, best = refine(carver, angles, axes)
    print(f"   coincidencia media (IoU) en la búsqueda: {best:.3f}")
    if not face_forward(ctx, views, angles, axes, head, SEARCH_SCALE):
        # Same silhouettes, mirrored front to back: turning the other way puts the face at +z.
        angles = [-a for a in angles]
        print("   giro invertido para que la cara mire hacia +z")

    factor = SEARCH_SCALE / FINAL_SCALE
    final_views = load_views(ctx, FINAL_SCALE)
    final_axes = [a * factor for a in axes]
    final = Carver(final_views, int(round(height * factor)), int(round(half * factor)))
    occupied = final.carve(angles, final_axes)
    _, ious = final.score(angles, final_axes)
    for i, (angle, iou) in enumerate(zip(angles, ious)):
        print(f"   foto {i}: {np.degrees(angle):7.1f}°  IoU {iou:.3f}")

    np.savez_compressed(
        ctx.work / "hull_photos.npz",
        occupied=occupied,
        scale=FINAL_SCALE,
        angles=np.array(angles),
        axes=np.array(final_axes),
        tops=np.array([v.top for v in final_views]),
        half=final.half,
        head=head * factor,
    )
    check_sheet(ctx, final, occupied, angles, final_axes)


def check_sheet(ctx: Context, carver: Carver, occupied: np.ndarray, angles, axes) -> None:
    """Silhouette of the volume over each photo mask: white = both, red = photo only, blue = volume only."""
    tiles = []
    y, xi, zi = np.nonzero(occupied)
    for rows, angle, axis in zip(carver.rows, angles, axes):
        u = carver.columns(angle, axis, rows.shape[1])[xi, zi]
        projected = np.zeros_like(rows)
        projected[y[u >= 0], u[u >= 0]] = True
        tile = np.zeros((*rows.shape, 3), np.uint8)
        tile[rows & projected] = (255, 255, 255)
        tile[rows & ~projected] = (60, 60, 255)
        tile[~rows & projected] = (255, 120, 60)
        tiles.append(tile)
    cv2.imwrite(str(ensure_dir(ctx.work / "checks") / "hull.png"), np.hstack(tiles))
