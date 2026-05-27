# AI Speaking Coach

AI Speaking Coach is a Laravel, Inertia, React, and Python MVP for recording practice sessions, transcribing audio, and generating feedback reports.

## Processing Pipeline

The beta pipeline is intentionally split by responsibility:

1. React records audio in the browser and uploads it to Laravel.
2. Laravel stores recordings on the configured private disk.
3. Laravel dispatches `ProcessPracticeSessionRecording`.
4. Laravel calls the isolated Python worker through Symfony Process.
5. Python performs audio preprocessing and transcription only.
6. Laravel stores the transcript and dispatches `AnalyzeSpeakingTranscript`.
7. Laravel generates the speaking feedback report.
8. Users view the transcript, status, recording playback, and feedback report in the app.

Python feedback generation is disabled in the default worker flow. `ai-worker/ai_worker/feedback.py` is kept only as future extraction/experiment code.

## Local Laravel Setup

Install PHP, Composer, Node.js, and a supported database. Then run:

```sh
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run build
```

For local development:

```sh
composer run dev
```

If you run services separately, use:

```sh
php artisan serve
php artisan queue:listen --tries=1
npm run dev
```

## Python Worker Setup

The worker lives in `ai-worker` and is isolated from Laravel app logic.

macOS or Linux:

```sh
sh ai-worker/setup.sh
```

Windows:

```bat
ai-worker\setup.bat
```

Set Laravel's Python path in `.env`:

```ini
AI_WORKER_PYTHON=/absolute/path/to/ai-worker/.venv/bin/python
```

Windows example:

```ini
AI_WORKER_PYTHON=C:\path\to\project\ai-worker\.venv\Scripts\python.exe
```

Verify the worker:

```sh
php artisan ai-worker:check
```

Run worker tests:

```sh
ai-worker/.venv/bin/python -m pytest ai-worker/tests
```

## OpenAI Configuration

The Python worker uses OpenAI for transcription. Add the API key to the environment used by queue workers:

```ini
OPENAI_API_KEY=
AI_TRANSCRIPTION_PROVIDER=openai
OPENAI_TRANSCRIPTION_MODEL=whisper-1
OPENAI_TRANSCRIPTION_TIMEOUT=120
OPENAI_TRANSCRIPTION_MAX_BYTES=26214400
```

Optional settings:

```ini
OPENAI_TRANSCRIPTION_LANGUAGE=
OPENAI_TRANSCRIPTION_PROMPT=
```

Keep `OPENAI_API_KEY` out of source control.

## Recording Storage And R2

Recordings must stay private. The local disk stores files under `storage/app/private`, and S3-compatible disks are configured with private visibility.

Local private storage:

```ini
PRACTICE_RECORDINGS_DISK=local
```

Cloudflare R2 or private S3-compatible storage:

```ini
PRACTICE_RECORDINGS_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=auto
AWS_BUCKET=
AWS_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_URL=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Do not run `storage:link` for recordings, and do not use the public disk for practice session audio. Playback is served through authenticated Laravel routes. For R2/S3, Laravel generates short-lived temporary URLs; for local storage, Laravel streams the private file.

When R2/S3 is used, Laravel copies the private object into a temporary local worker input file before calling Python, then deletes that temp file after the worker returns or fails.

## Queue Worker Setup

AI work must run on queues. In local development:

```sh
php artisan queue:listen --tries=1
```

For production, use a supervised queue worker:

```sh
php artisan queue:work --tries=2 --timeout=420
```

Make sure the worker process has:

- the same Laravel `.env` values as the web process
- access to `OPENAI_API_KEY`
- access to the Python virtual environment
- write access to `storage/app/private/ai-worker-inputs`
- write access to `ai-worker/temp` and `ai-worker/logs`

## Status Flow

Practice session statuses:

- `draft`
- `recorded`
- `transcribing`
- `transcribed`
- `analyzing`
- `analyzed`
- `failed`

Transcription failures and analysis failures both set the session to `failed`, log the exception, and notify the user. Failed transcription can be retried before a transcript exists. Failed analysis can be retried after a transcript exists and the feedback report failed.

## Security Notes

- Authenticated app routes are behind `auth`, `verified`, and profile completion middleware where appropriate.
- Practice session, recording playback, retry, and feedback report access use ownership policies.
- Users can only see their own sessions, recordings, transcripts, feedback reports, and notifications.
- Recording uploads validate file size, MIME type, extension, and processing state.
- Old recordings are cleaned up when replaced or when a practice session is deleted.

## Production Deployment Notes

- Set `APP_ENV=production` and `APP_DEBUG=false`.
- Use a real queue backend and a supervisor for queue workers.
- Run migrations before starting workers.
- Run `php artisan ai-worker:check` during deployment or release verification.
- Ensure `PRACTICE_RECORDINGS_DISK` points to a private disk.
- Configure R2/S3 bucket permissions so objects are not public.
- Keep OpenAI and storage credentials in the deployment secret manager.
- Monitor Laravel logs and `ai-worker/logs` for transcription failures.
- Run the Laravel feature tests and Python worker tests before release.
