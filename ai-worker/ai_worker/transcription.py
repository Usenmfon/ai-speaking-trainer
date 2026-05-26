from __future__ import annotations

import os
from pathlib import Path


def transcribe_audio(audio_path: Path) -> dict[str, object]:
    provider = os.getenv("AI_TRANSCRIPTION_PROVIDER", "mock").strip().lower()

    if provider != "mock" and not os.getenv("OPENAI_API_KEY"):
        return {
            "provider": provider,
            "status": "missing_api_key",
            "text": "",
            "segments": [],
        }

    return {
        "provider": provider,
        "status": "placeholder",
        "text": "Transcription placeholder. Connect a transcription provider to replace this text.",
        "segments": [
            {
                "start": 0,
                "end": None,
                "text": "Transcription placeholder. Connect a transcription provider to replace this text.",
            },
        ],
        "source": str(audio_path),
    }
