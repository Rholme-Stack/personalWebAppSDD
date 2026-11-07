"""Stage 2: person masks for the photos and head masks for the video frames (MediaPipe)."""

import urllib.request
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision

from . import Context, ensure_dir

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/"
    "selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite"
)
# Categories of the selfie multiclass model.
BACKGROUND, HAIR, BODY_SKIN, FACE_SKIN, CLOTHES, OTHERS = range(6)
CROP_MARGIN = 0.08


def download(url: str, folder: Path) -> Path:
    """Download a model once into the work folder (only the model travels, never the images)."""
    path = ensure_dir(folder) / url.rsplit("/", 1)[1]
    if not path.exists():
        print(f"   descargando {path.name}")
        urllib.request.urlretrieve(url, path)
    return path


def clean(mask: np.ndarray) -> np.ndarray:
    """Keep the largest blob and fill its holes."""
    count, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if count <= 1:
        return mask
    largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    blob = np.where(labels == largest, 255, 0).astype(np.uint8)
    flood = blob.copy()
    cv2.floodFill(flood, np.zeros((blob.shape[0] + 2, blob.shape[1] + 2), np.uint8), (0, 0), 255)
    return blob | cv2.bitwise_not(flood)


class Segmenter:
    def __init__(self, ctx: Context):
        options = vision.ImageSegmenterOptions(
            base_options=BaseOptions(model_asset_path=str(download(MODEL_URL, ctx.models_dir))),
            output_confidence_masks=True,
        )
        self._segmenter = vision.ImageSegmenter.create_from_options(options)

    def confidences(self, bgr: np.ndarray) -> np.ndarray:
        """Per-category confidence, shape (6, H, W)."""
        rgb = np.ascontiguousarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        result = self._segmenter.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
        return np.stack([m.numpy_view().reshape(bgr.shape[:2]) for m in result.confidence_masks])

    def close(self) -> None:
        self._segmenter.close()


def segment_photo(segmenter: Segmenter, bgr: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Person mask and category labels. A second pass on the upper body gives sharper edges."""
    first = segmenter.confidences(bgr)
    person = clean(((1 - first[BACKGROUND]) > 0.5).astype(np.uint8) * 255)
    ys, xs = np.nonzero(person)
    height, width = person.shape
    side = xs.max() - xs.min()
    x0 = max(0, int(xs.min() - CROP_MARGIN * side))
    x1 = min(width, int(xs.max() + CROP_MARGIN * side))
    y0 = max(0, int(ys.min() - CROP_MARGIN * side))
    y1 = min(height, int(ys.min() + 1.3 * side))

    conf = np.zeros_like(first)
    conf[BACKGROUND] = 1
    conf[:, y0:y1, x0:x1] = segmenter.confidences(bgr[y0:y1, x0:x1])
    person = clean(((1 - conf[BACKGROUND]) > 0.5).astype(np.uint8) * 255)
    labels = np.argmax(conf, axis=0).astype(np.uint8)
    labels[person == 0] = BACKGROUND
    return person, labels


def segment_frame(segmenter: Segmenter, bgr: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Head mask (hair + face skin) and person mask (everything but the background)."""
    conf = segmenter.confidences(bgr)
    head = ((conf[HAIR] + conf[FACE_SKIN]) > 0.5).astype(np.uint8) * 255
    person = ((1 - conf[BACKGROUND]) > 0.5).astype(np.uint8) * 255
    return clean(head), clean(person)


def run(ctx: Context) -> None:
    out = ensure_dir(ctx.masks_dir, clean=True)
    segmenter = Segmenter(ctx)
    try:
        for i, path in enumerate(ctx.photo_paths()):
            person, labels = segment_photo(segmenter, cv2.imread(str(path)))
            cv2.imwrite(str(out / f"photo_{i}.png"), person)
            cv2.imwrite(str(out / f"photo_{i}_labels.png"), labels)
        frames = sorted(ctx.frames_dir.glob("frame_*.jpg"))
        for path in frames:
            head, person = segment_frame(segmenter, cv2.imread(str(path)))
            cv2.imwrite(str(out / f"{path.stem}.png"), head)
            cv2.imwrite(str(out / f"{path.stem}_person.png"), person)
    finally:
        segmenter.close()
    print(f"   {len(ctx.photo_paths())} fotos y {len(frames)} fotogramas")
    contact_sheet(ctx)


def contact_sheet(ctx: Context) -> None:
    """Masks drawn over the images, for the manual check of this stage."""
    tiles = []
    for i, path in enumerate(ctx.photo_paths()):
        tiles.append(_overlay(cv2.imread(str(path)), cv2.imread(str(ctx.masks_dir / f"photo_{i}.png"), 0)))
    frames = sorted(ctx.frames_dir.glob("frame_*.jpg"))
    for path in frames[:: max(1, len(frames) // 16)][:16]:
        tiles.append(_overlay(cv2.imread(str(path)), cv2.imread(str(ctx.masks_dir / f"{path.stem}.png"), 0)))
    while len(tiles) % 6:
        tiles.append(np.zeros_like(tiles[0]))
    rows = [np.hstack(tiles[i : i + 6]) for i in range(0, len(tiles), 6)]
    cv2.imwrite(str(ensure_dir(ctx.work / "checks") / "segment.jpg"), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 80])


def _overlay(bgr: np.ndarray, mask: np.ndarray, size: tuple[int, int] = (180, 320)) -> np.ndarray:
    tint = bgr.copy()
    tint[mask > 0] = (0.45 * tint[mask > 0] + 0.55 * np.array([255, 82, 128])).astype(np.uint8)
    return cv2.resize(tint, size, interpolation=cv2.INTER_AREA)
