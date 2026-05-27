# AI Worker

The AI worker is an isolated Python process used by Laravel for audio preprocessing and transcription. For this MVP, feedback reports are generated in Laravel by `SpeakingFeedbackService` after a transcript is saved.

## Setup

From the project root on macOS or Linux:

```sh
sh ai-worker/setup.sh
```

From the project root on Windows:

```bat
ai-worker\setup.bat
```

The setup script will create `ai-worker/.venv`, install `requirements.txt`, create `temp` and `logs`, and copy `ai-worker/.env.example` to `ai-worker/.env` if needed.

After setup, add your OpenAI key:

```ini
OPENAI_API_KEY=your-api-key
```

`worker.py` loads `ai-worker/.env` automatically for manual runs. Laravel queue workers should still have the same key available from the main Laravel environment, especially in production.

Also set Laravel's worker Python path in the main Laravel `.env`:

```ini
AI_WORKER_PYTHON=/absolute/path/to/ai-worker/.venv/bin/python
```

On Windows this usually looks like:

```ini
AI_WORKER_PYTHON=C:\path\to\project\ai-worker\.venv\Scripts\python.exe
```

## How Laravel Calls The Worker

When a user uploads a practice recording, Laravel dispatches `ProcessPracticeSessionRecording`. That job calls `AiWorkerClient`, which runs:

```sh
python ai-worker/worker.py --task process_recording --audio-path /path/to/audio
```

The worker returns JSON with `preprocessing` and `transcription` data. Laravel stores the transcript, then dispatches `AnalyzeSpeakingTranscript` so Laravel can generate the feedback report.

The worker does not generate feedback in the MVP. The `feedback` task returns a disabled response, and `ai_worker/feedback.py` is kept only as future experimental code for a possible microservice extraction.

## Manual Test

Use a real audio file supported by OpenAI, such as WebM, MP3, WAV, OGG, M4A, MP4, MPEG, MPGA, or FLAC.

macOS or Linux:

```sh
ai-worker/.venv/bin/python ai-worker/worker.py --task transcribe --audio-path /path/to/audio.webm
```

Windows:

```bat
ai-worker\.venv\Scripts\python.exe ai-worker\worker.py --task transcribe --audio-path C:\path\to\audio.webm
```

Expected successful output keeps the worker envelope:

```json
{
  "ok": true,
  "task": "transcribe",
  "data": {
    "transcription": {
      "success": true,
      "transcript": "Full transcript text here",
      "language": "en",
      "duration_seconds": 120,
      "segments": [],
      "provider": "openai",
      "model": "whisper-1"
    }
  },
  "errors": [],
  "meta": {}
}
```

## Automated Tests

The worker uses `pytest` for offline tests. The tests mock transcription/OpenAI behavior and do not call the real OpenAI API.

macOS or Linux:

```sh
ai-worker/.venv/bin/python -m pytest ai-worker/tests
```

Windows:

```bat
ai-worker\.venv\Scripts\python.exe -m pytest ai-worker\tests
```

Run the setup script again if `pytest` is missing:

```sh
ai-worker/.venv/bin/python -m pip install -r ai-worker/requirements.txt
```

## Common Errors

`OPENAI_API_KEY is required for OpenAI transcription.`

Add `OPENAI_API_KEY` to the environment used by the process. For Laravel queue workers, that usually means the main Laravel `.env`.

`The openai Python package is not installed.`

Run the setup script again, or install dependencies manually:

```sh
ai-worker/.venv/bin/python -m pip install -r ai-worker/requirements.txt
```

`Invalid audio format.`

Use one of the supported audio extensions: WebM, MP3, WAV, OGG, M4A, MP4, MPEG, MPGA, or FLAC.

`Audio file is too large for OpenAI transcription.`

The default limit is 25 MB. Record a shorter take or compress the audio before upload.

`AI worker timed out.`

Increase `AI_WORKER_TIMEOUT` in Laravel `.env` or `OPENAI_TRANSCRIPTION_TIMEOUT` for the worker request.

`python.exe` opens the Microsoft Store on Windows.

Install Python from python.org, then rerun `ai-worker\setup.bat`. After setup, point Laravel to `ai-worker\.venv\Scripts\python.exe`.
