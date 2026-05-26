from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any

from ai_worker.contracts import error_response, success_response
from ai_worker.feedback import generate_feedback
from ai_worker.logging_setup import configure_logging
from ai_worker.preprocessing import prepare_audio
from ai_worker.transcription import transcribe_audio

WORKER_ROOT = Path(__file__).resolve().parent
LOGGER = logging.getLogger("ai_worker")


def main() -> int:
    configure_logging(WORKER_ROOT)
    parser = argparse.ArgumentParser(prog="ai-worker")
    parser.add_argument("--task", required=True, choices=["process_recording", "transcribe", "preprocess", "feedback"])
    parser.add_argument("--audio-path")
    parser.add_argument("--session-id")
    parser.add_argument("--recording-id")
    parser.add_argument("--metadata-json", default="{}")

    args = parser.parse_args()

    try:
        metadata = parse_metadata(args.metadata_json)
        response = run_task(args, metadata)
        print(json.dumps(response, ensure_ascii=False))

        return 0 if response["ok"] else 1
    except Exception as exception:
        LOGGER.exception("Worker task failed")
        print(json.dumps(error_response(args.task, str(exception), exception.__class__.__name__), ensure_ascii=False))

        return 1


def run_task(args: argparse.Namespace, metadata: dict[str, Any]) -> dict[str, Any]:
    audio_path = Path(args.audio_path).resolve() if args.audio_path else None
    temp_dir = WORKER_ROOT / "temp"
    task = args.task

    LOGGER.info("Starting task=%s session_id=%s recording_id=%s", task, args.session_id, args.recording_id)

    if task == "feedback":
        transcript = str(metadata.get("transcript", ""))

        return success_response(task, {"feedback": generate_feedback(transcript, metadata)}, metadata=worker_meta(args))

    if audio_path is None:
        return error_response(task, "--audio-path is required", "missing_audio_path")

    preprocessing = prepare_audio(audio_path, temp_dir)

    if task == "preprocess":
        return success_response(task, {"preprocessing": preprocessing}, metadata=worker_meta(args))

    transcription = transcribe_audio(Path(str(preprocessing["working_path"])))

    if task == "transcribe":
        return success_response(
            task,
            {
                "preprocessing": preprocessing,
                "transcription": transcription,
            },
            metadata=worker_meta(args),
        )

    feedback = generate_feedback(str(transcription.get("text", "")), {**metadata, **preprocessing})

    return success_response(
        task,
        {
            "preprocessing": preprocessing,
            "transcription": transcription,
            "feedback": feedback,
        },
        metadata=worker_meta(args),
    )


def parse_metadata(raw_metadata: str) -> dict[str, Any]:
    decoded = json.loads(raw_metadata)

    if not isinstance(decoded, dict):
        raise ValueError("--metadata-json must decode to an object")

    return decoded


def worker_meta(args: argparse.Namespace) -> dict[str, Any]:
    return {
        "session_id": args.session_id,
        "recording_id": args.recording_id,
        "worker": "local-python",
    }


if __name__ == "__main__":
    sys.exit(main())
