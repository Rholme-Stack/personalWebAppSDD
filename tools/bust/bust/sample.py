"""Stage 6: spread ~8000 nodes over the bust surface and write bust.bin.

Nodes are denser where the shape reads best (DESIGN.md): edges and ridges (ears, nose, jaw,
shoulder line), the hairline and the face features.
"""

import cv2
import numpy as np

from . import Context, export
from .segment import BODY_SKIN, FACE_SKIN, HAIR

TARGET_NODES = 8000
SMOOTH_SIGMA = 1.2  # voxels
WEIGHT_RIDGE = 1.5  # extra weight at the sharpest ridges (curvature)
WEIGHT_HAIRLINE = 2.0
WEIGHT_FACE = 0.6  # extra weight on the face surface
WEIGHT_FEATURE = 5.0  # extra weight on the eye, brow, nose, lip and jaw lines
BOTTOM_FADE = 0.15  # the lowest 15 % of the bust gets gradually fewer nodes: it fades out
BOTTOM_WEIGHT = 0.3  # instead of ending in a dense rim
SEED = 20261107


def smooth(occupied: np.ndarray) -> np.ndarray:
    volume = occupied.astype(np.float32)
    for y in range(volume.shape[0]):
        volume[y] = cv2.GaussianBlur(volume[y], (0, 0), SMOOTH_SIGMA)
    kernel = cv2.getGaussianKernel(int(SMOOTH_SIGMA * 6) | 1, SMOOTH_SIGMA)
    flat = volume.reshape(volume.shape[0], -1)
    return cv2.sepFilter2D(flat, -1, np.ones(1), kernel).reshape(volume.shape)


def surface(field: np.ndarray, half: int):
    """Points on the 0.5 iso-surface, their outward normals and a curvature value."""
    inside = field >= 0.5
    padded = np.pad(inside, 1)
    border = np.zeros_like(inside)
    for axis in range(3):
        for shift in (-1, 1):
            border |= ~np.roll(padded, shift, axis=axis)[1:-1, 1:-1, 1:-1]
    idx = np.argwhere(inside & border)

    grad = np.stack(np.gradient(field), axis=-1)[tuple(idx.T)]  # (dy, dx, dz)
    length = np.linalg.norm(grad, axis=1, keepdims=True) + 1e-6
    values = field[tuple(idx.T)][:, None]
    offset = np.clip((0.5 - values) * grad / length**2, -1, 1)
    yxz = idx + offset
    normals_yxz = -grad / length

    padded_field = np.pad(field, 1, mode="edge")
    laplacian = -6 * field
    for axis in range(3):
        for shift in (-1, 1):
            laplacian += np.roll(padded_field, shift, axis=axis)[1:-1, 1:-1, 1:-1]
    curvature = np.abs(laplacian[tuple(idx.T)]) / length[:, 0]

    points = np.stack([yxz[:, 1] - half, yxz[:, 0], yxz[:, 2] - half], axis=1)  # x, y (down), z
    normals = np.stack([normals_yxz[:, 1], normals_yxz[:, 0], normals_yxz[:, 2]], axis=1)
    return points, normals, curvature


def labels_from_photos(ctx: Context, hull, points: np.ndarray, normals: np.ndarray) -> np.ndarray:
    """Segmentation category of each point, read from the photo that sees it most from the front."""
    angles = hull["angles"]
    toward = np.stack([-np.sin(angles), np.zeros_like(angles), np.cos(angles)], axis=1)
    best = np.argmax(normals @ toward.T, axis=1)
    scale = int(hull["scale"])
    labels = np.zeros(len(points), np.uint8)
    for i, angle in enumerate(angles):
        chosen = best == i
        if not chosen.any():
            continue
        photo = cv2.imread(str(ctx.masks_dir / f"photo_{i}_labels.png"), cv2.IMREAD_GRAYSCALE)
        x, y, z = points[chosen].T
        u = np.rint((x * np.cos(angle) + z * np.sin(angle) + hull["axes"][i]) * scale).astype(int)
        v = np.rint((y + hull["tops"][i]) * scale).astype(int)
        u = np.clip(u, 0, photo.shape[1] - 1)
        v = np.clip(v, 0, photo.shape[0] - 1)
        labels[chosen] = photo[v, u]
    return labels


def hairline(points: np.ndarray, labels: np.ndarray, radius: float = 2.5) -> np.ndarray:
    """Points whose neighborhood has both hair and skin."""
    hair = labels == HAIR
    skin = (labels == FACE_SKIN) | (labels == BODY_SKIN)
    cells: dict[tuple, list[int]] = {}
    keys = np.floor(points / radius).astype(int)
    for i, key in enumerate(map(tuple, keys)):
        cells.setdefault(key, []).append(i)
    result = np.zeros(len(points), bool)
    for key, members in cells.items():
        near = [j for dx in (-1, 0, 1) for dy in (-1, 0, 1) for dz in (-1, 0, 1)
                for j in cells.get((key[0] + dx, key[1] + dy, key[2] + dz), [])]
        if hair[near].any() and skin[near].any():
            result[members] = True
    return result


def thin(points: np.ndarray, weights: np.ndarray, radius: float, rng: np.random.Generator) -> np.ndarray:
    """Dart throwing with a radius that shrinks where the weight is higher: denser nodes there."""
    radii = radius / np.sqrt(weights)
    cell = radii.min()
    reach = int(np.ceil(radii.max() / cell))
    grid: dict[tuple, list[int]] = {}
    accepted: list[int] = []
    order = rng.permutation(len(points))
    keys = np.floor(points / cell).astype(int)
    for i in order:
        kx, ky, kz = keys[i]
        clear = True
        for dx in range(-reach, reach + 1):
            for dy in range(-reach, reach + 1):
                for dz in range(-reach, reach + 1):
                    for j in grid.get((kx + dx, ky + dy, kz + dz), ()):
                        if np.sum((points[i] - points[j]) ** 2) < min(radii[i], radii[j]) ** 2:
                            clear = False
                            break
                    if not clear:
                        break
                if not clear:
                    break
            if not clear:
                break
        if clear:
            accepted.append(i)
            grid.setdefault((kx, ky, kz), []).append(i)
    return np.array(accepted)


def run(ctx: Context) -> None:
    hull = np.load(ctx.work / "hull.npz")
    occupied, half = hull["occupied"], int(hull["half"])
    points, normals, curvature = surface(smooth(occupied), half)

    # The flat cut under the chest and its edge are not part of the bust.
    bottom = (points[:, 1] >= occupied.shape[0] - 3) & (normals[:, 1] > 0.5)
    bottom |= points[:, 1] > occupied.shape[0] - 2.5
    points, normals, curvature = points[~bottom], normals[~bottom], curvature[~bottom]

    labels = labels_from_photos(ctx, hull, points, normals)
    ridge = np.clip(curvature / np.percentile(curvature, 95), 0, 1)
    weights = 1 + WEIGHT_RIDGE * ridge + WEIGHT_HAIRLINE * hairline(points, labels)
    fade = np.clip((points[:, 1] / occupied.shape[0] - (1 - BOTTOM_FADE)) / BOTTOM_FADE, 0, 1)
    weights = weights * (1 - fade) + BOTTOM_WEIGHT * fade

    face_path = ctx.work / "face.npz"
    if face_path.exists():
        face = np.load(face_path)
        oval = face["oval"].astype(np.float32)
        in_oval = np.array([cv2.pointPolygonTest(oval, (float(x), float(y)), False) >= 0 for x, y in points[:, :2]])
        replaced = in_oval & (normals[:, 2] > 0.3)
        points, weights = points[~replaced], weights[~replaced]
        points = np.vstack([points, face["surface"], face["features"]])
        weights = np.concatenate([
            weights,
            np.full(len(face["surface"]), 1 + WEIGHT_FACE),
            np.full(len(face["features"]), 1 + WEIGHT_FEATURE),
        ])

    rng = np.random.default_rng(SEED)
    low, high = 0.5, 20.0
    chosen = np.array([], int)
    for _ in range(12):
        radius = (low + high) / 2
        chosen = thin(points, weights, radius, np.random.default_rng(SEED))
        if abs(len(chosen) - TARGET_NODES) < TARGET_NODES * 0.02:
            break
        low, high = (radius, high) if len(chosen) > TARGET_NODES else (low, radius)

    nodes = points[chosen] * np.array([1, -1, 1])  # y up
    center = (nodes.min(axis=0) + nodes.max(axis=0)) / 2
    nodes = (nodes - center) * (2 / (nodes.max(axis=0) - nodes.min(axis=0)).max())
    nodes = nodes[rng.permutation(len(nodes))]

    export.write(ctx.out, nodes)
    back = export.read(ctx.out)
    if back.shape != nodes.shape or np.abs(back - nodes).max() > 1 / export.INT16_MAX:
        raise RuntimeError("bust.bin no coincide al releerlo.")
    np.savez_compressed(ctx.work / "nodes.npz", nodes=nodes, center=center)
    size = ctx.out.stat().st_size
    print(f"   {len(nodes)} nodos -> {ctx.out} ({size} bytes = 12 + {len(nodes)} × 6)")
