from __future__ import annotations

import os
from pathlib import Path
from typing import Any

SUPPORTED_AUDIO_EXTENSIONS = {
    ".flac",
    ".m4a",
    ".mp3",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".ogg",
    ".wav",
    ".webm",
}

OPENAI_MAX_AUDIO_BYTES = 25 * 1024 * 1024


class TranscriptionError(RuntimeError):
    pass


def transcribe_audio(audio_path: Path) -> dict[str, object]:
    provider = os.getenv("AI_TRANSCRIPTION_PROVIDER", "openai").strip().lower()

    if provider != "openai":
        raise TranscriptionError(f"Unsupported transcription provider: {provider}")

    validate_audio_file(audio_path)

    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    if not api_key:
        raise TranscriptionError("OPENAI_API_KEY is required for OpenAI transcription.")

    return transcribe_with_openai(audio_path, api_key)


def validate_audio_file(audio_path: Path) -> None:
    if not audio_path.exists() or not audio_path.is_file():
        raise FileNotFoundError(f"Audio file does not exist: {audio_path}")

    if audio_path.stat().st_size <= 0:
        raise TranscriptionError("Audio file is empty.")

    max_bytes = int(
        os.getenv("OPENAI_TRANSCRIPTION_MAX_BYTES", str(OPENAI_MAX_AUDIO_BYTES))
    )

    if audio_path.stat().st_size > max_bytes:
        raise TranscriptionError("Audio file is too large for OpenAI transcription.")

    if audio_path.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_AUDIO_EXTENSIONS))

        raise TranscriptionError(f"Invalid audio format. Supported extensions are: {supported}.")


def transcribe_with_openai(audio_path: Path, api_key: str) -> dict[str, object]:
    try:
        from openai import APIError, APITimeoutError, OpenAI, OpenAIError
    except ImportError as exception:
        raise TranscriptionError(
            "The openai Python package is not installed. Run pip install -r requirements.txt."
        ) from exception

    model = (
        os.getenv("OPENAI_TRANSCRIPTION_MODEL", "whisper-1").strip()
        or "whisper-1"
    )
    timeout = float(os.getenv("OPENAI_TRANSCRIPTION_TIMEOUT", "120"))
    client = OpenAI(api_key=api_key, timeout=timeout)

    request: dict[str, Any] = {
        "model": model,
        "response_format": "verbose_json",
        "temperature": float(os.getenv("OPENAI_TRANSCRIPTION_TEMPERATURE", "0")),
    }

    language = os.getenv("OPENAI_TRANSCRIPTION_LANGUAGE", "").strip()
    prompt = os.getenv("OPENAI_TRANSCRIPTION_PROMPT", "").strip()

    if language:
        request["language"] = language

    if prompt:
        request["prompt"] = prompt

    if model == "whisper-1":
        request["timestamp_granularities"] = ["segment"]

    try:
        with audio_path.open("rb") as audio_file:
            response = client.audio.transcriptions.create(
                file=audio_file,
                **request,
            )
    except APITimeoutError as exception:
        raise TranscriptionError("OpenAI transcription request timed out.") from exception
    except APIError as exception:
        raise TranscriptionError(f"OpenAI API error: {exception}") from exception
    except OpenAIError as exception:
        raise TranscriptionError(f"OpenAI transcription failed: {exception}") from exception

    normalized = normalize_openai_response(response, model)

    if not str(normalized["transcript"]).strip():
        raise TranscriptionError("OpenAI returned an empty transcript.")

    return normalized


def normalize_openai_response(response: object, model: str) -> dict[str, object]:
    payload = (
        response.model_dump(mode="json")
        if hasattr(response, "model_dump")
        else response
    )

    if not isinstance(payload, dict):
        raise TranscriptionError("OpenAI returned an unexpected transcription response.")

    transcript = str(payload.get("text") or "")
    language = payload.get("language")
    duration = payload.get("duration")
    segments = normalize_segments(payload.get("segments"))

    return {
        "success": True,
        "transcript": transcript,
        "text": transcript,
        "language": language,
        "duration_seconds": duration,
        "segments": segments,
        "provider": "openai",
        "model": model,
    }


def normalize_segments(raw_segments: object) -> list[dict[str, object]]:
    if not isinstance(raw_segments, list):
        return []

    segments: list[dict[str, object]] = []

    for item in raw_segments:
        if not isinstance(item, dict):
            continue

        segments.append(
            {
                "id": item.get("id"),
                "start": item.get("start"),
                "end": item.get("end"),
                "text": item.get("text"),
            }
        )

    return segments
