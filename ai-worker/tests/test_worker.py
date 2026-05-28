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
    normalize_gemini_response,
    transcribe_audio,
    transcribe_with_gemini,
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

    with pytest.raises(TranscriptionError, match="Supported providers are: openai, gemini, local"):
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
