from __future__ import annotations

import base64
import json
import mimetypes
import os
import uuid
from http.client import HTTPException
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

SUPPORTED_AUDIO_EXTENSIONS = {
    ".aac",
    ".flac",
    ".m4a",
    ".mkv",
    ".mp3",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".oga",
    ".ogg",
    ".opus",
    ".wav",
    ".webm",
}

OPENAI_MAX_AUDIO_BYTES = 25 * 1024 * 1024
GEMINI_INLINE_MAX_AUDIO_BYTES = 15 * 1024 * 1024
XAI_MAX_AUDIO_BYTES = 500 * 1024 * 1024
GROQ_MAX_AUDIO_BYTES = 25 * 1024 * 1024


class TranscriptionError(RuntimeError):
    pass


def transcribe_audio(audio_path: Path) -> dict[str, object]:
    # Keep this separate from Laravel's AI_TRANSCRIPTION_PROVIDER. In Laravel,
    # "python_worker" means "send transcription to Python"; inside Python, the
    # provider names the upstream transcription API used by the worker.
    provider = os.getenv("AI_WORKER_TRANSCRIPTION_PROVIDER", "openai").strip().lower()

    validate_audio_file(audio_path, provider)

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

    if provider == "grok":
        api_key = os.getenv("XAI_API_KEY", os.getenv("GROK_API_KEY", "")).strip()

        if not api_key:
            raise TranscriptionError("XAI_API_KEY or GROK_API_KEY is required for Grok transcription.")

        return transcribe_with_grok(audio_path, api_key)

    if provider == "groq":
        api_key = os.getenv("GROQ_API_KEY", "").strip()

        if not api_key:
            raise TranscriptionError("GROQ_API_KEY is required for Groq transcription.")

        return transcribe_with_groq(audio_path, api_key)

    supported = ", ".join(supported_transcription_providers())
    raise TranscriptionError(
        f"Unsupported transcription provider: {provider}. Supported providers are: {supported}."
    )


def supported_transcription_providers() -> tuple[str, ...]:
    return ("openai", "gemini", "grok", "groq", "local")


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


def transcribe_with_grok(audio_path: Path, api_key: str) -> dict[str, object]:
    if not api_key:
        raise TranscriptionError("XAI_API_KEY or GROK_API_KEY is required for Grok transcription.")

    model = "grok-speech-to-text"
    endpoint = os.getenv(
        "XAI_TRANSCRIPTION_ENDPOINT",
        os.getenv("GROK_TRANSCRIPTION_ENDPOINT", "https://api.x.ai/v1/stt"),
    ).strip() or "https://api.x.ai/v1/stt"
    timeout = float(
        os.getenv(
            "XAI_TRANSCRIPTION_TIMEOUT",
            os.getenv("GROK_TRANSCRIPTION_TIMEOUT", "120"),
        )
    )
    language = os.getenv(
        "XAI_TRANSCRIPTION_LANGUAGE",
        os.getenv("GROK_TRANSCRIPTION_LANGUAGE", ""),
    ).strip()
    fields: list[tuple[str, str]] = []

    if language:
        fields.append(("language", language))

    if env_bool("XAI_TRANSCRIPTION_FORMAT", "GROK_TRANSCRIPTION_FORMAT", default=False):
        fields.append(("format", "true"))

    if env_bool("XAI_TRANSCRIPTION_DIARIZE", "GROK_TRANSCRIPTION_DIARIZE", default=False):
        fields.append(("diarize", "true"))

    if env_bool("XAI_TRANSCRIPTION_FILLER_WORDS", "GROK_TRANSCRIPTION_FILLER_WORDS", default=False):
        fields.append(("filler_words", "true"))

    keyterms = os.getenv(
        "XAI_TRANSCRIPTION_KEYTERMS",
        os.getenv("GROK_TRANSCRIPTION_KEYTERMS", ""),
    )

    for keyterm in [item.strip() for item in keyterms.split(",")]:
        if keyterm:
            fields.append(("keyterm", keyterm))

    response = post_multipart(
        url=endpoint,
        fields=fields,
        file_path=audio_path,
        file_mime_type=xai_audio_mime_type(audio_path),
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=timeout,
        provider_name="Grok",
    )
    normalized = normalize_grok_response(response, model)

    if not str(normalized["transcript"]).strip():
        raise TranscriptionError("Grok returned an empty transcript.")

    return normalized


def transcribe_with_groq(audio_path: Path, api_key: str) -> dict[str, object]:
    if not api_key:
        raise TranscriptionError("GROQ_API_KEY is required for Groq transcription.")

    try:
        from openai import APIError, APITimeoutError, OpenAI, OpenAIError
    except ImportError as exception:
        raise TranscriptionError(
            "The openai Python package is not installed. Run pip install -r requirements.txt."
        ) from exception

    model = (
        os.getenv("GROQ_TRANSCRIPTION_MODEL", "whisper-large-v3-turbo").strip()
        or "whisper-large-v3-turbo"
    )
    timeout = float(os.getenv("GROQ_TRANSCRIPTION_TIMEOUT", "120"))
    client = OpenAI(
        api_key=api_key,
        base_url=groq_base_url(),
        timeout=timeout,
    )
    request: dict[str, Any] = {
        "model": model,
        "response_format": "verbose_json",
    }
    language = os.getenv("GROQ_TRANSCRIPTION_LANGUAGE", "").strip()
    prompt = os.getenv("GROQ_TRANSCRIPTION_PROMPT", "").strip()

    if language:
        request["language"] = language

    if prompt:
        request["prompt"] = prompt

    try:
        with audio_path.open("rb") as audio_file:
            response = client.audio.transcriptions.create(
                file=audio_file,
                **request,
            )
    except APITimeoutError as exception:
        raise TranscriptionError("Groq transcription request timed out.") from exception
    except APIError as exception:
        raise TranscriptionError(f"Groq API error: {exception}") from exception
    except OpenAIError as exception:
        raise TranscriptionError(f"Groq transcription failed: {exception}") from exception

    normalized = normalize_groq_response(response, model)

    if not str(normalized["transcript"]).strip():
        raise TranscriptionError("Groq returned an empty transcript.")

    return normalized


def groq_base_url() -> str:
    configured = os.getenv("GROQ_BASE_URL", "").strip()

    if configured:
        return configured.rstrip("/")

    endpoint = os.getenv("GROQ_TRANSCRIPTION_ENDPOINT", "").strip()

    if endpoint.endswith("/audio/transcriptions"):
        return endpoint.removesuffix("/audio/transcriptions").rstrip("/")

    return "https://api.groq.com/openai/v1"


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


def xai_audio_mime_type(audio_path: Path) -> str:
    configured = os.getenv(
        "XAI_TRANSCRIPTION_MIME_TYPE",
        os.getenv("GROK_TRANSCRIPTION_MIME_TYPE", ""),
    ).strip()

    if configured:
        return configured

    return audio_mime_type(audio_path)


def audio_mime_type(audio_path: Path, env_name: str | None = None) -> str:
    if env_name is not None:
        configured = os.getenv(env_name, "").strip()

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
        ".opus": "audio/opus",
        ".wav": "audio/wav",
        ".flac": "audio/flac",
        ".aac": "audio/aac",
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
            message = provider_error_message(decoded, message)
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


def post_multipart(
    url: str,
    fields: list[tuple[str, str]],
    file_path: Path,
    file_mime_type: str,
    headers: dict[str, str],
    timeout: float,
    provider_name: str,
) -> dict[str, object]:
    boundary = f"----aiworker{uuid.uuid4().hex}"
    body_parts: list[bytes] = []

    for name, value in fields:
        body_parts.extend(
            [
                f"--{boundary}\r\n".encode("utf-8"),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"),
                str(value).encode("utf-8"),
                b"\r\n",
            ]
        )

    body_parts.extend(
        [
            f"--{boundary}\r\n".encode("utf-8"),
            (
                f'Content-Disposition: form-data; name="file"; filename="{file_path.name}"\r\n'
            ).encode("utf-8"),
            f"Content-Type: {file_mime_type}\r\n\r\n".encode("utf-8"),
            file_path.read_bytes(),
            b"\r\n",
            f"--{boundary}--\r\n".encode("utf-8"),
        ]
    )

    request = Request(
        url=url,
        data=b"".join(body_parts),
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
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
            message = provider_error_message(decoded, message)
        except (OSError, json.JSONDecodeError):
            pass

        raise TranscriptionError(f"{provider_name} API error: {message}") from exception
    except TimeoutError as exception:
        raise TranscriptionError(f"{provider_name} transcription request timed out.") from exception
    except (HTTPException, OSError, URLError) as exception:
        raise TranscriptionError(f"{provider_name} transcription failed: {exception}") from exception

    try:
        decoded = json.loads(body)
    except json.JSONDecodeError as exception:
        raise TranscriptionError(f"{provider_name} returned invalid JSON.") from exception

    if not isinstance(decoded, dict):
        raise TranscriptionError(f"{provider_name} returned an unexpected transcription response.")

    return decoded


def provider_error_message(decoded: object, fallback: str) -> str:
    if isinstance(decoded, dict):
        error = decoded.get("error")

        if isinstance(error, dict):
            message = error.get("message")

            if isinstance(message, str) and message:
                return message

        if isinstance(error, str) and error:
            return error

        message = decoded.get("message")

        if isinstance(message, str) and message:
            return message

        detail = decoded.get("detail")

        if isinstance(detail, str) and detail:
            return detail

    if isinstance(decoded, str) and decoded:
        return decoded

    return fallback


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


def normalize_grok_response(response: dict[str, object], model: str) -> dict[str, object]:
    transcript = str(response.get("text") or "")
    language = response.get("language")
    duration = response.get("duration")

    return {
        "success": True,
        "transcript": transcript,
        "text": transcript,
        "language": language,
        "duration_seconds": duration,
        "segments": normalize_words(response.get("words")),
        "provider": "grok",
        "model": model,
    }


def normalize_groq_response(response: dict[str, object], model: str) -> dict[str, object]:
    if hasattr(response, "model_dump"):
        response = response.model_dump(mode="json")

    if not isinstance(response, dict):
        raise TranscriptionError("Groq returned an unexpected transcription response.")

    transcript = str(response.get("text") or "")
    language = response.get("language")
    duration = response.get("duration")

    return {
        "success": True,
        "transcript": transcript,
        "text": transcript,
        "language": language,
        "duration_seconds": duration,
        "segments": normalize_segments(response.get("segments")),
        "provider": "groq",
        "model": model,
    }


def validate_audio_file(audio_path: Path, provider: str = "openai") -> None:
    if not audio_path.exists() or not audio_path.is_file():
        raise FileNotFoundError(f"Audio file does not exist: {audio_path}")

    if audio_path.stat().st_size <= 0:
        raise TranscriptionError("Audio file is empty.")

    max_bytes = max_audio_bytes(provider)

    if audio_path.stat().st_size > max_bytes:
        raise TranscriptionError("Audio file is too large for transcription.")

    if audio_path.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_AUDIO_EXTENSIONS))

        raise TranscriptionError(f"Invalid audio format. Supported extensions are: {supported}.")


def max_audio_bytes(provider: str) -> int:
    if provider == "grok":
        return int(
            os.getenv(
                "XAI_TRANSCRIPTION_MAX_BYTES",
                os.getenv("GROK_TRANSCRIPTION_MAX_BYTES", str(XAI_MAX_AUDIO_BYTES)),
            )
        )

    if provider == "groq":
        return int(os.getenv("GROQ_TRANSCRIPTION_MAX_BYTES", str(GROQ_MAX_AUDIO_BYTES)))

    if provider == "gemini":
        return int(
            os.getenv("GEMINI_TRANSCRIPTION_MAX_BYTES", str(GEMINI_INLINE_MAX_AUDIO_BYTES))
        )

    return int(
        os.getenv("OPENAI_TRANSCRIPTION_MAX_BYTES", str(OPENAI_MAX_AUDIO_BYTES))
    )


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


def normalize_words(raw_words: object) -> list[dict[str, object]]:
    if not isinstance(raw_words, list):
        return []

    words: list[dict[str, object]] = []

    for item in raw_words:
        if not isinstance(item, dict):
            continue

        words.append(
            {
                "start": item.get("start"),
                "end": item.get("end"),
                "text": item.get("text"),
                "speaker": item.get("speaker"),
            }
        )

    return words


def env_bool(*names: str, default: bool = False) -> bool:
    for name in names:
        value = os.getenv(name)

        if value is None or value.strip() == "":
            continue

        return value.strip().lower() in {"1", "true", "yes", "on"}

    return default
