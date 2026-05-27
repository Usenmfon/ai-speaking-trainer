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
from ai_worker.transcription import TranscriptionError, transcribe_with_openai  # noqa: E402


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
