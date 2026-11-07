"""bust.bin writer and reader (format in specs/003-constelacion/data-model.md)."""

import struct
from pathlib import Path

import numpy as np

MAGIC = b"BUST"
VERSION = 1
INT16_MAX = 32767


def write(path: Path, positions: np.ndarray) -> None:
    """positions: (count, 3) in -1..1, already shuffled."""
    quantized = np.clip(np.rint(positions * INT16_MAX), -INT16_MAX, INT16_MAX).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        f.write(MAGIC + struct.pack("<II", VERSION, len(positions)) + quantized.tobytes())


def read(path: Path) -> np.ndarray:
    data = path.read_bytes()
    if data[:4] != MAGIC:
        raise ValueError("bust.bin: does not start with BUST")
    version, count = struct.unpack("<II", data[4:12])
    if version != VERSION or len(data) != 12 + count * 6:
        raise ValueError("bust.bin: unknown version or wrong size")
    return np.frombuffer(data, "<i2", offset=12).reshape(count, 3) / INT16_MAX
