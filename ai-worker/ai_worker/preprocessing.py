from __future__ import annotations

import hashlib
import mimetypes
import shutil
import wave
from pathlib import Path
from uuid import uuid4


def prepare_audio(audio_path: Path, temp_dir: Path) -> dict[str, object]:
    if not audio_path.exists() or not audio_path.is_file():
        raise FileNotFoundError(f"Audio file does not exist: {audio_path}")

    temp_dir.mkdir(parents=True, exist_ok=True)
    working_path = temp_dir / f"{uuid4()}{audio_path.suffix or '.audio'}"
    shutil.copy2(audio_path, working_path)

    return {
        "source_path": str(audio_path),
        "working_path": str(working_path),
        "sha256": file_sha256(working_path),
        "mime_type": mimetypes.guess_type(working_path.name)[0] or "application/octet-stream",
        "size": working_path.stat().st_size,
        "duration_seconds": detect_wav_duration(working_path),
    }


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as audio_file:
        for chunk in iter(lambda: audio_file.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()


def detect_wav_duration(path: Path) -> float | None:
    if path.suffix.lower() != ".wav":
        return None

    try:
        with wave.open(str(path), "rb") as wav_file:
            frames = wav_file.getnframes()
            rate = wav_file.getframerate()

            if rate <= 0:
                return None

            return round(frames / float(rate), 2)
    except wave.Error:
        return None
