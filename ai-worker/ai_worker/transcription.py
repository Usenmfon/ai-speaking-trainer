from __future__ import annotations

import base64
import json
import mimetypes
import os
from http.client import HTTPException
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

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
GEMINI_INLINE_MAX_AUDIO_BYTES = 15 * 1024 * 1024


class TranscriptionError(RuntimeError):
    pass


def transcribe_audio(audio_path: Path) -> dict[str, object]:
    # Keep this separate from Laravel's AI_TRANSCRIPTION_PROVIDER. In Laravel,
    # "python_worker" means "send transcription to Python"; inside Python, the
    # provider names the upstream transcription API used by the worker.
    provider = os.getenv("AI_WORKER_TRANSCRIPTION_PROVIDER", "openai").strip().lower()

    validate_audio_file(audio_path)

    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "").strip()

        if not api_key:
            raise TranscriptionError("OPENAI_API_KEY is required for OpenAI transcription.")

        return transcribe_with_openai(audio_path, api_key)

    if provider == "local":
        return transcribe_with_local_placeholder(audio_path)

    if provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")).strip()

        if not api_key:
            raise TranscriptionError("GEMINI_API_KEY is required for Gemini transcription.")

        return transcribe_with_gemini(audio_path, api_key)

    supported = ", ".join(supported_transcription_providers())
    raise TranscriptionError(
        f"Unsupported transcription provider: {provider}. Supported providers are: {supported}."
    )


def supported_transcription_providers() -> tuple[str, ...]:
    return ("openai", "gemini", "local")


def transcribe_with_local_placeholder(audio_path: Path) -> dict[str, object]:
    transcript = os.getenv(
        "LOCAL_TRANSCRIPTION_TEXT",
        "Local placeholder transcript. Configure a real transcription provider before using this in production.",
    ).strip()

    if not transcript:
        raise TranscriptionError("LOCAL_TRANSCRIPTION_TEXT cannot be empty.")

    return {
        "success": True,
        "transcript": transcript,
        "text": transcript,
        "language": os.getenv("LOCAL_TRANSCRIPTION_LANGUAGE", "en").strip() or "en",
        "duration_seconds": None,
        "segments": [],
        "provider": "local",
        "model": "placeholder",
        "source_filename": audio_path.name,
    }


def transcribe_with_openai(audio_path: Path, api_key: str) -> dict[str, object]:
    if not api_key:
        raise TranscriptionError("OPENAI_API_KEY is required for OpenAI transcription.")

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


def transcribe_with_gemini(audio_path: Path, api_key: str) -> dict[str, object]:
    max_bytes = int(
        os.getenv("GEMINI_TRANSCRIPTION_MAX_BYTES", str(GEMINI_INLINE_MAX_AUDIO_BYTES))
    )

    if audio_path.stat().st_size > max_bytes:
        raise TranscriptionError(
            "Audio file is too large for Gemini inline transcription. "
            "Use a shorter recording or add a Files API based provider."
        )

    model = (
        os.getenv("GEMINI_TRANSCRIPTION_MODEL", "gemini-2.5-flash").strip()
        or "gemini-2.5-flash"
    )
    timeout = float(os.getenv("GEMINI_TRANSCRIPTION_TIMEOUT", "120"))
    endpoint = os.getenv(
        "GEMINI_TRANSCRIPTION_ENDPOINT",
        "https://generativelanguage.googleapis.com/v1beta",
    ).rstrip("/")
    mime_type = gemini_audio_mime_type(audio_path)
    prompt = os.getenv(
        "GEMINI_TRANSCRIPTION_PROMPT",
        "Transcribe this audio exactly. Return only the transcript text.",
    ).strip()

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64.b64encode(audio_path.read_bytes()).decode("ascii"),
                        },
                    },
                ],
            }
        ],
        "generationConfig": {
            "temperature": float(os.getenv("GEMINI_TRANSCRIPTION_TEMPERATURE", "0")),
        },
    }

    response = post_json(
        url=f"{endpoint}/{model_path(model)}:generateContent",
        payload=payload,
        headers={"x-goog-api-key": api_key},
        timeout=timeout,
    )
    normalized = normalize_gemini_response(response, model)

    if not str(normalized["transcript"]).strip():
        raise TranscriptionError("Gemini returned an empty transcript.")

    return normalized


def model_path(model: str) -> str:
    return model if model.startswith("models/") else f"models/{model}"


def gemini_audio_mime_type(audio_path: Path) -> str:
    configured = os.getenv("GEMINI_TRANSCRIPTION_MIME_TYPE", "").strip()

    if configured:
        return configured

    extension = audio_path.suffix.lower()

    return {
        ".webm": "audio/webm",
        ".mp4": "audio/mp4",
        ".m4a": "audio/mp4",
        ".mp3": "audio/mpeg",
        ".mpeg": "audio/mpeg",
        ".mpga": "audio/mpeg",
        ".oga": "audio/ogg",
        ".ogg": "audio/ogg",
        ".wav": "audio/wav",
        ".flac": "audio/flac",
    }.get(extension, mimetypes.guess_type(audio_path.name)[0] or "application/octet-stream")


def post_json(
    url: str,
    payload: dict[str, object],
    headers: dict[str, str],
    timeout: float,
) -> dict[str, object]:
    request = Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            **headers,
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=timeout) as response:
            body = response.read().decode("utf-8")
    except HTTPError as exception:
        message = exception.reason

        try:
            error_body = exception.read().decode("utf-8")
            decoded = json.loads(error_body)
            message = (
                decoded.get("error", {}).get("message")
                if isinstance(decoded, dict)
                else message
            ) or message
        except (OSError, json.JSONDecodeError):
            pass

        raise TranscriptionError(f"Gemini API error: {message}") from exception
    except TimeoutError as exception:
        raise TranscriptionError("Gemini transcription request timed out.") from exception
    except (HTTPException, OSError, URLError) as exception:
        raise TranscriptionError(f"Gemini transcription failed: {exception}") from exception

    try:
        decoded = json.loads(body)
    except json.JSONDecodeError as exception:
        raise TranscriptionError("Gemini returned invalid JSON.") from exception

    if not isinstance(decoded, dict):
        raise TranscriptionError("Gemini returned an unexpected transcription response.")

    return decoded


def normalize_gemini_response(response: dict[str, object], model: str) -> dict[str, object]:
    candidates = response.get("candidates")

    if not isinstance(candidates, list) or len(candidates) == 0:
        prompt_feedback = response.get("promptFeedback")
        block_reason = (
            prompt_feedback.get("blockReason")
            if isinstance(prompt_feedback, dict)
            else None
        )

        if isinstance(block_reason, str) and block_reason:
            raise TranscriptionError(f"Gemini transcription response was blocked: {block_reason}.")

        raise TranscriptionError("Gemini transcription response did not include candidates.")

    first_candidate = candidates[0]

    if not isinstance(first_candidate, dict):
        raise TranscriptionError("Gemini returned an invalid candidate.")

    content = first_candidate.get("content")
    parts = content.get("parts") if isinstance(content, dict) else None

    if not isinstance(parts, list):
        raise TranscriptionError("Gemini transcription response did not include text parts.")

    transcript = "".join(
        str(part.get("text"))
        for part in parts
        if isinstance(part, dict) and isinstance(part.get("text"), str)
    ).strip()

    return {
        "success": True,
        "transcript": transcript,
        "text": transcript,
        "language": None,
        "duration_seconds": None,
        "segments": [],
        "provider": "gemini",
        "model": model,
    }


def validate_audio_file(audio_path: Path) -> None:
    if not audio_path.exists() or not audio_path.is_file():
        raise FileNotFoundError(f"Audio file does not exist: {audio_path}")

    if audio_path.stat().st_size <= 0:
        raise TranscriptionError("Audio file is empty.")

    max_bytes = int(
        os.getenv("OPENAI_TRANSCRIPTION_MAX_BYTES", str(OPENAI_MAX_AUDIO_BYTES))
    )

    if audio_path.stat().st_size > max_bytes:
        raise TranscriptionError("Audio file is too large for transcription.")

    if audio_path.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_AUDIO_EXTENSIONS))

        raise TranscriptionError(f"Invalid audio format. Supported extensions are: {supported}.")


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
