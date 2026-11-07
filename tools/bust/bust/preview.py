"""Stage 7: renders the bust like the web does, next to the photo taken from the same angle."""

import cv2
import numpy as np

from . import Context, ensure_dir, export

CAMERA_DISTANCE = 4.2
FOV_Y = np.radians(35)
SIZE = (360, 480)  # width, height of each render
SUPERSAMPLE = 2
PALETTE_BGR = [(255, 82, 128), (193, 227, 79), (255, 123, 79), (240, 75, 224), (110, 132, 21)]
PALETTE_WEIGHTS = [0.3, 0.25, 0.2, 0.15, 0.1]


def render(nodes: np.ndarray, yaw: float, colors: np.ndarray) -> np.ndarray:
    width, height = SIZE[0] * SUPERSAMPLE, SIZE[1] * SUPERSAMPLE
    tan_half = np.tan(FOV_Y / 2)
    p = nodes * 0.75 * CAMERA_DISTANCE * tan_half  # the bust fills 75 % of the height, as on desktop
    c, s = np.cos(yaw), np.sin(yaw)
    x, y, z = c * p[:, 0] + s * p[:, 2], p[:, 1], -s * p[:, 0] + c * p[:, 2]
    depth = CAMERA_DISTANCE - z
    u = (x / (tan_half * width / height) / depth * 0.5 + 0.5) * width
    v = (0.5 - y / tan_half / depth * 0.5) * height
    k = np.clip((z + 1) / 2, 0, 1)
    sizes = (1.5 + 2.5 * k) * SUPERSAMPLE / 2
    alpha = 0.35 + 0.65 * k

    image = np.zeros((height, width, 3), np.float32)
    for i in np.argsort(z):
        cv2.circle(image, (int(u[i]), int(v[i])), max(1, int(round(sizes[i]))), colors[i] * alpha[i], -1, cv2.LINE_AA)
    image = cv2.resize(np.clip(image, 0, 255), SIZE, interpolation=cv2.INTER_AREA)
    return image.astype(np.uint8)


def photo_crop(ctx: Context, hull, index: int) -> np.ndarray:
    scale, half = int(hull["scale"]), int(hull["half"])
    photo = cv2.imread(str(ctx.photo_paths()[index]))
    top = int((hull["tops"][index] - 0.15 * hull["occupied"].shape[0]) * scale)
    bottom = int((hull["tops"][index] + 1.15 * hull["occupied"].shape[0]) * scale)
    axis = hull["axes"][index] * scale
    side = (bottom - top) * SIZE[0] / SIZE[1] / 2
    crop = photo[max(0, top) : bottom, max(0, int(axis - side)) : int(axis + side)]
    return cv2.resize(crop, SIZE, interpolation=cv2.INTER_AREA)


def run(ctx: Context) -> None:
    out = ensure_dir(ctx.previews_dir, clean=True)
    hull = np.load(ctx.work / "hull.npz")
    nodes = export.read(ctx.out)
    rng = np.random.default_rng(7)
    colors = np.array(PALETTE_BGR, np.float32)[rng.choice(len(PALETTE_BGR), len(nodes), p=PALETTE_WEIGHTS)]

    pairs = []
    order = np.argsort([((a + np.pi) % (2 * np.pi)) for a in hull["angles"]])
    for i in order:
        angle = float(hull["angles"][i])
        degrees = int(round(np.degrees((angle + np.pi) % (2 * np.pi) - np.pi)))
        pair = np.hstack([photo_crop(ctx, hull, i), render(nodes, angle, colors)])
        cv2.putText(pair, f"{degrees} deg", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.imwrite(str(out / f"preview_{i}_{degrees}.png"), pair)
        pairs.append(pair)
    rows = [np.hstack(pairs[i : i + 2]) for i in range(0, len(pairs), 2)]
    cv2.imwrite(str(out / "sheet.png"), np.vstack(rows))
    print(f"   vistas previas en {out}")
