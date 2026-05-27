from __future__ import annotations

import hashlib
import mimetypes
import os
import shutil
import wave
from pathlib import Path
from uuid import uuid4

SUPPORTED_AUDIO_EXTENSIONS = {
    ".webm",
    ".mp3",
    ".wav",
    ".mpeg",
    ".mpga",
    ".ogg",
    ".oga",
    ".m4a",
    ".mp4",
    ".flac",
}


def prepare_audio(audio_path: Path, temp_dir: Path) -> dict[str, object]:
    if not audio_path.exists() or not audio_path.is_file():
        raise FileNotFoundError(f"Audio file does not exist: {audio_path}")

    if audio_path.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS:
        raise ValueError(f"Unsupported audio format: {audio_path.suffix or 'unknown'}")

    source_size = audio_path.stat().st_size

    if source_size <= 0:
        raise ValueError("Audio file is empty.")

    ensure_readable_audio(audio_path)

    temp_dir.mkdir(parents=True, exist_ok=True)
    working_path = temp_dir / f"{uuid4()}{audio_path.suffix or '.audio'}"
    shutil.copy2(audio_path, working_path)

    duration_seconds = detect_wav_duration(working_path)
    max_duration_seconds = int(os.getenv("AI_WORKER_MAX_DURATION_SECONDS", "7200"))

    if duration_seconds is not None and duration_seconds > max_duration_seconds:
        raise ValueError(f"Audio duration exceeds {max_duration_seconds} seconds.")

    return {
        "source_path": str(audio_path),
        "working_path": str(working_path),
        "sha256": file_sha256(working_path),
        "mime_type": mimetypes.guess_type(working_path.name)[0] or "application/octet-stream",
        "size": working_path.stat().st_size,
        "duration_seconds": duration_seconds,
    }


def ensure_readable_audio(path: Path) -> None:
    try:
        with path.open("rb") as audio_file:
            if audio_file.read(4096) == b"":
                raise ValueError("Audio file is empty.")
    except OSError as exc:
        raise ValueError(f"Audio file is not readable: {exc}") from exc


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
