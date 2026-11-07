"""Stage 1: keep the sharpest video frame of every ~0.25 s window."""

import cv2
import numpy as np

from . import Context, ensure_dir

WINDOW_SECONDS = 0.25
CANDIDATE_STEP = 3  # only every 3rd frame of a window is decoded and scored
OUT_WIDTH = 1080  # frames are saved at 1080 px wide (portrait 1080x1920)
SCORE_WIDTH = 540


def sharpness(frame: np.ndarray) -> float:
    """Variance of the Laplacian: higher means sharper."""
    small = cv2.resize(frame, (SCORE_WIDTH, round(frame.shape[0] * SCORE_WIDTH / frame.shape[1])))
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def run(ctx: Context) -> None:
    out = ensure_dir(ctx.frames_dir, clean=True)
    cap = cv2.VideoCapture(str(ctx.video))
    fps = cap.get(cv2.CAP_PROP_FPS)
    window = max(1, round(fps * WINDOW_SECONDS))

    best: tuple[float, np.ndarray] | None = None
    saved = 0
    index = 0
    while cap.grab():
        if index % CANDIDATE_STEP == 0:
            ok, frame = cap.retrieve()
            if ok:
                score = sharpness(frame)
                if best is None or score > best[0]:
                    best = (score, frame)
        if (index + 1) % window == 0 and best is not None:
            saved = _save(out, saved, best[1])
            best = None
        index += 1
    if best is not None:
        saved = _save(out, saved, best[1])
    cap.release()
    print(f"   {saved} fotogramas de {index} ({index / fps:.1f} s)")


def _save(out, number: int, frame: np.ndarray) -> int:
    height = round(frame.shape[0] * OUT_WIDTH / frame.shape[1])
    resized = cv2.resize(frame, (OUT_WIDTH, height), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(out / f"frame_{number:03d}.jpg"), resized, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return number + 1
