"""Stages that turn Rodrigo's local photos and video into the constellation bust (feature 003)."""

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Context:
    """Input and output paths shared by every stage."""

    photos: Path
    video: Path
    work: Path
    out: Path

    @property
    def frames_dir(self) -> Path:
        return self.work / "frames"

    @property
    def masks_dir(self) -> Path:
        return self.work / "masks"

    @property
    def models_dir(self) -> Path:
        return self.work / "models"

    @property
    def previews_dir(self) -> Path:
        return self.work / "previews"

    def photo_paths(self) -> list[Path]:
        """The 8 photos in the order they were taken (file names are timestamps)."""
        return sorted(p for p in self.photos.iterdir() if p.suffix.lower() in {".jpg", ".jpeg"})


def ensure_dir(path: Path, clean: bool = False) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    if clean:
        for child in path.iterdir():
            if child.is_file():
                child.unlink()
    return path
