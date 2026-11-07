"""Build public/constellation/bust.bin from local photos and video.

The photos and the video are only read: they are never copied into the repository.
Intermediate files go to the work folder (outside the repository by default).

Usage:
    uv run build.py --photos <folder with the 8 jpg> --video <mp4> [--work <folder>] [--out <file>]
                    [--from-stage <stage>]
"""

import argparse
import os
import sys
import time
from pathlib import Path

from bust import Context, face, frames, hull, preview, sample, segment, video_head

STAGES = {
    "frames": frames.run,
    "segment": segment.run,
    "hull": hull.run,
    "video_head": video_head.run,
    "face": face.run,
    "sample": sample.run,
    "preview": preview.run,
}

REPO_ROOT = Path(__file__).resolve().parents[2]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Genera el busto de la constelación (feature 003).")
    parser.add_argument("--photos", type=Path, required=True, help="Carpeta con las 8 fotos (jpg).")
    parser.add_argument("--video", type=Path, required=True, help="Vídeo selfie de la cabeza (mp4).")
    parser.add_argument(
        "--work",
        type=Path,
        default=Path(os.environ.get("TEMP", "/tmp")) / "bust-work",
        help="Carpeta de trabajo para los archivos intermedios (por defecto, %%TEMP%%\\bust-work).",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=REPO_ROOT / "public" / "constellation" / "bust.bin",
        help="Archivo de salida (por defecto, public/constellation/bust.bin).",
    )
    parser.add_argument(
        "--from-stage",
        choices=list(STAGES),
        default="frames",
        help="Empieza en esta etapa y reutiliza los resultados de las anteriores.",
    )
    return parser.parse_args()


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    args = parse_args()
    if not args.photos.is_dir() or not args.video.is_file():
        print("No se encuentran las fotos o el vídeo.", file=sys.stderr)
        return 1
    if REPO_ROOT in args.work.resolve().parents and args.work.resolve() != REPO_ROOT / "tools" / "bust" / "work":
        print("La carpeta de trabajo no puede estar dentro del repositorio.", file=sys.stderr)
        return 1

    ctx = Context(photos=args.photos, video=args.video, work=args.work, out=args.out)
    ctx.work.mkdir(parents=True, exist_ok=True)
    names = list(STAGES)
    for name in names[names.index(args.from_stage) :]:
        started = time.perf_counter()
        print(f"== {name}")
        STAGES[name](ctx)
        print(f"   {name}: {time.perf_counter() - started:.1f} s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
