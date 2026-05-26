#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
VENV_DIR="$ROOT_DIR/.venv"

if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
else
    echo "Python 3 was not found. Install Python 3.11+ and run this script again."
    exit 1
fi

echo "Setting up AI worker in $ROOT_DIR"

if [ ! -d "$VENV_DIR" ]; then
    "$PYTHON_BIN" -m venv "$VENV_DIR"
    echo "Created virtual environment at $VENV_DIR"
else
    echo "Virtual environment already exists at $VENV_DIR"
fi

if [ -x "$VENV_DIR/bin/python" ]; then
    VENV_PYTHON="$VENV_DIR/bin/python"
elif [ -x "$VENV_DIR/Scripts/python.exe" ]; then
    VENV_PYTHON="$VENV_DIR/Scripts/python.exe"
else
    echo "Could not find the virtual environment Python executable."
    exit 1
fi

"$VENV_PYTHON" -m pip install --upgrade pip
"$VENV_PYTHON" -m pip install -r "$ROOT_DIR/requirements.txt"

mkdir -p "$ROOT_DIR/temp" "$ROOT_DIR/logs"

if [ ! -f "$ROOT_DIR/.env" ]; then
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    echo "Created ai-worker/.env from .env.example"
else
    echo "ai-worker/.env already exists"
fi

cat <<EOF

AI worker setup complete.

Next steps:
1. Add OPENAI_API_KEY to ai-worker/.env and to the Laravel .env used by queue workers.
2. Set AI_WORKER_PYTHON in Laravel .env to:
   $VENV_PYTHON
3. From the Laravel project root, run your queue worker:
   php artisan queue:work
4. Manually test the worker with:
   $VENV_PYTHON $ROOT_DIR/worker.py --task transcribe --audio-path /path/to/audio.webm

EOF
