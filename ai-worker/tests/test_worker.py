from __future__ import annotations

import json
import sys
import types
from pathlib import Path
from typing import Any

import pytest

WORKER_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WORKER_ROOT))

import worker  # noqa: E402
from ai_worker.transcription import (  # noqa: E402
    TranscriptionError,
    gemini_audio_mime_type,
    groq_base_url,
    normalize_gemini_response,
    normalize_grok_response,
    normalize_groq_response,
    provider_error_message,
    transcribe_audio,
    transcribe_with_gemini,
    transcribe_with_grok,
    transcribe_with_groq,
    transcribe_with_openai,
)


def run_worker(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
    args: list[str],
) -> tuple[int, dict[str, Any]]:
    monkeypatch.setattr(worker, "WORKER_ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["worker.py", *args])

    exit_code = worker.main()
    captured = capsys.readouterr()

    return exit_code, json.loads(captured.out)


def test_health_check_returns_json(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
) -> None:
    exit_code, response = run_worker(
        monkeypatch,
        capsys,
        tmp_path,
        ["--task", "health_check"],
    )

    assert exit_code == 0
    assert response["success"] is True
    assert response["status"] == "ok"
    assert response["worker"] == "available"
    assert isinstance(response["python_version"], str)


def test_missing_audio_path_returns_failure_json(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
) -> None:
    exit_code, response = run_worker(
        monkeypatch,
        capsys,
        tmp_path,
        ["--task", "transcribe"],
    )

    assert exit_code == 1
    assert response["ok"] is False
    assert response["errors"][0]["code"] == "missing_audio_path"
    assert "--audio-path is required" in response["errors"][0]["message"]


def test_missing_audio_file_returns_failure_json(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
) -> None:
    exit_code, response = run_worker(
        monkeypatch,
        capsys,
        tmp_path,
        ["--task", "transcribe", "--audio-path", str(tmp_path / "missing.webm")],
    )

    assert exit_code == 1
    assert response["ok"] is False
    assert response["errors"][0]["code"] == "FileNotFoundError"
    assert "Audio file does not exist" in response["errors"][0]["message"]


def test_invalid_audio_path_returns_failure_json(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
) -> None:
    invalid_audio_path = tmp_path / "speech.txt"
    invalid_audio_path.write_text("not-audio", encoding="utf-8")

    exit_code, response = run_worker(
        monkeypatch,
        capsys,
        tmp_path,
        ["--task", "transcribe", "--audio-path", str(invalid_audio_path)],
    )

    assert exit_code == 1
    assert response["ok"] is False
    assert response["errors"][0]["code"] == "ValueError"
    assert "Unsupported audio format" in response["errors"][0]["message"]


def test_successful_mocked_transcription_response(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    def fake_transcribe_audio(path: Path) -> dict[str, object]:
        assert path.exists()

        return {
            "success": True,
            "transcript": "Practice makes confident speakers.",
            "text": "Practice makes confident speakers.",
            "language": "en",
            "duration_seconds": 4.2,
            "segments": [
                {
                    "id": 0,
                    "start": 0.0,
                    "end": 4.2,
                    "text": "Practice makes confident speakers.",
                }
            ],
            "provider": "openai",
            "model": "whisper-1",
        }

    monkeypatch.setattr(worker, "transcribe_audio", fake_transcribe_audio)

    exit_code, response = run_worker(
        monkeypatch,
        capsys,
        tmp_path,
        [
            "--task",
            "transcribe",
            "--audio-path",
            str(audio_path),
            "--session-id",
            "session-1",
            "--recording-id",
            "recording-1",
        ],
    )

    assert exit_code == 0
    assert response["ok"] is True
    assert response["task"] == "transcribe"
    assert response["data"]["transcription"]["transcript"] == "Practice makes confident speakers."
    assert response["data"]["transcription"]["segments"][0]["text"] == "Practice makes confident speakers."
    assert response["meta"]["session_id"] == "session-1"
    assert response["meta"]["recording_id"] == "recording-1"


def test_preprocess_success_response_uses_worker_meta(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    def fake_prepare_audio(path: Path, temp_dir: Path) -> dict[str, object]:
        assert path == audio_path

        return {
            "source_path": str(path),
            "working_path": str(path),
            "sha256": "abc123",
            "mime_type": "audio/webm",
            "size": path.stat().st_size,
            "duration_seconds": None,
        }

    monkeypatch.setattr(worker, "prepare_audio", fake_prepare_audio)

    exit_code, response = run_worker(
        monkeypatch,
        capsys,
        tmp_path,
        [
            "--task",
            "preprocess",
            "--audio-path",
            str(audio_path),
            "--session-id",
            "session-1",
            "--recording-id",
            "recording-1",
        ],
    )

    assert exit_code == 0
    assert response["ok"] is True
    assert response["data"]["preprocessing"]["mime_type"] == "audio/webm"
    assert response["meta"]["session_id"] == "session-1"
    assert response["meta"]["recording_id"] == "recording-1"


def test_laravel_transcription_provider_env_does_not_override_worker_provider(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("AI_TRANSCRIPTION_PROVIDER", "python_worker")
    monkeypatch.setenv("AI_WORKER_TRANSCRIPTION_PROVIDER", "openai")
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")

    def fake_transcribe_with_openai(path: Path, api_key: str) -> dict[str, object]:
        assert path == audio_path
        assert api_key == "test-key"

        return {
            "success": True,
            "transcript": "Provider separation works.",
            "text": "Provider separation works.",
            "language": "en",
            "duration_seconds": 1,
            "segments": [],
            "provider": "openai",
            "model": "whisper-1",
        }

    monkeypatch.setattr(
        "ai_worker.transcription.transcribe_with_openai",
        fake_transcribe_with_openai,
    )

    response = transcribe_audio(audio_path)

    assert response["transcript"] == "Provider separation works."


def test_local_transcription_provider_returns_placeholder(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("AI_WORKER_TRANSCRIPTION_PROVIDER", "local")
    monkeypatch.setenv("LOCAL_TRANSCRIPTION_TEXT", "This came from the local provider.")
    monkeypatch.setenv("LOCAL_TRANSCRIPTION_LANGUAGE", "en")

    response = transcribe_audio(audio_path)

    assert response["provider"] == "local"
    assert response["model"] == "placeholder"
    assert response["transcript"] == "This came from the local provider."


def test_unknown_transcription_provider_lists_supported_providers(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("AI_WORKER_TRANSCRIPTION_PROVIDER", "unknown")

    with pytest.raises(TranscriptionError, match="Supported providers are: openai, gemini, grok, groq, local"):
        transcribe_audio(audio_path)


def test_successful_mocked_gemini_transcription_response(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("GEMINI_TRANSCRIPTION_MODEL", "gemini-2.5-flash")

    def fake_post_json(
        url: str,
        payload: dict[str, object],
        headers: dict[str, str],
        timeout: float,
    ) -> dict[str, object]:
        assert url.endswith("/models/gemini-2.5-flash:generateContent")
        assert headers["x-goog-api-key"] == "test-gemini-key"
        assert timeout == 120

        return {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": "Gemini heard this clearly.",
                            }
                        ]
                    }
                }
            ]
        }

    monkeypatch.setattr("ai_worker.transcription.post_json", fake_post_json)

    response = transcribe_with_gemini(audio_path, "test-gemini-key")

    assert response["provider"] == "gemini"
    assert response["model"] == "gemini-2.5-flash"
    assert response["transcript"] == "Gemini heard this clearly."


def test_gemini_webm_upload_uses_audio_mime_type(tmp_path: Path) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    assert gemini_audio_mime_type(audio_path) == "audio/webm"


def test_gemini_provider_is_switchable_from_worker_env(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("AI_WORKER_TRANSCRIPTION_PROVIDER", "gemini")
    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini-key")

    def fake_transcribe_with_gemini(path: Path, api_key: str) -> dict[str, object]:
        assert path == audio_path
        assert api_key == "test-gemini-key"

        return {
            "success": True,
            "transcript": "Gemini provider selected.",
            "text": "Gemini provider selected.",
            "language": None,
            "duration_seconds": None,
            "segments": [],
            "provider": "gemini",
            "model": "gemini-2.5-flash",
        }

    monkeypatch.setattr(
        "ai_worker.transcription.transcribe_with_gemini",
        fake_transcribe_with_gemini,
    )

    response = transcribe_audio(audio_path)

    assert response["provider"] == "gemini"
    assert response["transcript"] == "Gemini provider selected."


def test_successful_mocked_grok_transcription_response(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("XAI_TRANSCRIPTION_LANGUAGE", "en")
    monkeypatch.setenv("XAI_TRANSCRIPTION_FORMAT", "true")
    monkeypatch.setenv("XAI_TRANSCRIPTION_KEYTERMS", "AI Speaking Coach, Laravel")

    def fake_post_multipart(
        url: str,
        fields: list[tuple[str, str]],
        file_path: Path,
        file_mime_type: str,
        headers: dict[str, str],
        timeout: float,
        provider_name: str,
    ) -> dict[str, object]:
        assert url == "https://api.x.ai/v1/stt"
        assert fields == [
            ("language", "en"),
            ("format", "true"),
            ("keyterm", "AI Speaking Coach"),
            ("keyterm", "Laravel"),
        ]
        assert file_path == audio_path
        assert file_mime_type == "audio/webm"
        assert headers["Authorization"] == "Bearer test-xai-key"
        assert timeout == 120
        assert provider_name == "Grok"

        return {
            "text": "Grok transcribed this clearly.",
            "language": "English",
            "duration": 2.35,
            "words": [
                {"text": "Grok", "start": 0.0, "end": 0.4},
                {"text": "transcribed", "start": 0.4, "end": 1.1},
            ],
        }

    monkeypatch.setattr("ai_worker.transcription.post_multipart", fake_post_multipart)

    response = transcribe_with_grok(audio_path, "test-xai-key")

    assert response["provider"] == "grok"
    assert response["model"] == "grok-speech-to-text"
    assert response["transcript"] == "Grok transcribed this clearly."
    assert response["language"] == "English"
    assert response["duration_seconds"] == 2.35
    assert response["segments"][0]["text"] == "Grok"


def test_grok_provider_is_switchable_from_worker_env(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("AI_WORKER_TRANSCRIPTION_PROVIDER", "grok")
    monkeypatch.setenv("XAI_API_KEY", "test-xai-key")

    def fake_transcribe_with_grok(path: Path, api_key: str) -> dict[str, object]:
        assert path == audio_path
        assert api_key == "test-xai-key"

        return {
            "success": True,
            "transcript": "Grok provider selected.",
            "text": "Grok provider selected.",
            "language": "English",
            "duration_seconds": 1.2,
            "segments": [],
            "provider": "grok",
            "model": "grok-speech-to-text",
        }

    monkeypatch.setattr(
        "ai_worker.transcription.transcribe_with_grok",
        fake_transcribe_with_grok,
    )

    response = transcribe_audio(audio_path)

    assert response["provider"] == "grok"
    assert response["transcript"] == "Grok provider selected."


def test_normalize_grok_response_handles_word_timestamps() -> None:
    response = normalize_grok_response(
        {
            "text": "Hello from Grok.",
            "language": "English",
            "duration": 1.5,
            "words": [
                {"text": "Hello", "start": 0.0, "end": 0.5, "speaker": 0},
            ],
        },
        "grok-speech-to-text",
    )

    assert response["transcript"] == "Hello from Grok."
    assert response["provider"] == "grok"
    assert response["segments"][0]["speaker"] == 0


def test_successful_mocked_groq_transcription_response(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("GROQ_TRANSCRIPTION_LANGUAGE", "en")
    monkeypatch.setenv("GROQ_TRANSCRIPTION_PROMPT", "Industry terms: Laravel, Inertia")

    class FakeTranscriptions:
        def create(self, **kwargs: object) -> object:
            assert kwargs["model"] == "whisper-large-v3-turbo"
            assert kwargs["response_format"] == "verbose_json"
            assert kwargs["language"] == "en"
            assert kwargs["prompt"] == "Industry terms: Laravel, Inertia"
            assert kwargs["file"].read() == b"webm-audio"

            return {
                "text": "Groq transcribed this clearly.",
                "language": "en",
                "duration": 2.35,
                "segments": [
                    {"id": 0, "start": 0.0, "end": 2.35, "text": "Groq transcribed this clearly."},
                ],
            }

    class FakeAudio:
        transcriptions = FakeTranscriptions()

    class FakeOpenAI:
        def __init__(self, **kwargs: object) -> None:
            assert kwargs["api_key"] == "test-groq-key"
            assert str(kwargs["base_url"]) == "https://api.groq.com/openai/v1"
            assert kwargs["timeout"] == 120
            self.audio = FakeAudio()

    fake_openai_module = types.SimpleNamespace(
        APIError=Exception,
        APITimeoutError=type("FakeTimeoutError", (Exception,), {}),
        OpenAI=FakeOpenAI,
        OpenAIError=Exception,
    )

    monkeypatch.setitem(sys.modules, "openai", fake_openai_module)

    response = transcribe_with_groq(audio_path, "test-groq-key")

    assert response["provider"] == "groq"
    assert response["model"] == "whisper-large-v3-turbo"
    assert response["transcript"] == "Groq transcribed this clearly."
    assert response["language"] == "en"
    assert response["duration_seconds"] == 2.35
    assert response["segments"][0]["text"] == "Groq transcribed this clearly."


def test_groq_base_url_can_be_derived_from_endpoint(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(
        "GROQ_TRANSCRIPTION_ENDPOINT",
        "https://api.groq.com/openai/v1/audio/transcriptions",
    )

    assert groq_base_url() == "https://api.groq.com/openai/v1"


def test_groq_provider_is_switchable_from_worker_env(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    monkeypatch.setenv("AI_WORKER_TRANSCRIPTION_PROVIDER", "groq")
    monkeypatch.setenv("GROQ_API_KEY", "test-groq-key")

    def fake_transcribe_with_groq(path: Path, api_key: str) -> dict[str, object]:
        assert path == audio_path
        assert api_key == "test-groq-key"

        return {
            "success": True,
            "transcript": "Groq provider selected.",
            "text": "Groq provider selected.",
            "language": "en",
            "duration_seconds": 1.2,
            "segments": [],
            "provider": "groq",
            "model": "whisper-large-v3-turbo",
        }

    monkeypatch.setattr(
        "ai_worker.transcription.transcribe_with_groq",
        fake_transcribe_with_groq,
    )

    response = transcribe_audio(audio_path)

    assert response["provider"] == "groq"
    assert response["transcript"] == "Groq provider selected."


def test_normalize_groq_response_handles_segments() -> None:
    response = normalize_groq_response(
        {
            "text": "Hello from Groq.",
            "language": "en",
            "duration": 1.5,
            "segments": [
                {"id": 0, "start": 0.0, "end": 1.5, "text": "Hello from Groq."},
            ],
        },
        "whisper-large-v3-turbo",
    )

    assert response["transcript"] == "Hello from Groq."
    assert response["provider"] == "groq"
    assert response["segments"][0]["id"] == 0


def test_provider_error_message_accepts_string_error_body() -> None:
    assert provider_error_message({"error": "Forbidden"}, "fallback") == "Forbidden"
    assert provider_error_message({"error": {"message": "Invalid API key"}}, "fallback") == "Invalid API key"
    assert provider_error_message({"message": "Rate limited"}, "fallback") == "Rate limited"


def test_gemini_blocked_response_is_wrapped() -> None:
    with pytest.raises(TranscriptionError, match="blocked"):
        normalize_gemini_response(
            {"promptFeedback": {"blockReason": "SAFETY"}},
            "gemini-2.5-flash",
        )


def test_openai_api_failure_is_wrapped(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audio_path = tmp_path / "speech.webm"
    audio_path.write_bytes(b"webm-audio")

    class FakeOpenAIError(Exception):
        pass

    class FakeTranscriptions:
        def create(self, **kwargs: object) -> object:
            raise FakeOpenAIError("provider unavailable")

    class FakeAudio:
        transcriptions = FakeTranscriptions()

    class FakeOpenAI:
        def __init__(self, **kwargs: object) -> None:
            self.audio = FakeAudio()

    fake_openai_module = types.SimpleNamespace(
        APIError=FakeOpenAIError,
        APITimeoutError=type("FakeTimeoutError", (FakeOpenAIError,), {}),
        OpenAI=FakeOpenAI,
        OpenAIError=FakeOpenAIError,
    )

    monkeypatch.setitem(sys.modules, "openai", fake_openai_module)

    with pytest.raises(TranscriptionError, match="OpenAI API error"):
        transcribe_with_openai(audio_path, "test-key")
