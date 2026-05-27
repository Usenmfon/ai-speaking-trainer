<?php

$defaultPython = PHP_OS_FAMILY === 'Windows'
    ? base_path('ai-worker/.venv/Scripts/python.exe')
    : base_path('ai-worker/.venv/bin/python');

return [
    'root' => base_path('ai-worker'),
    'python' => env('AI_WORKER_PYTHON') ?: $defaultPython,
    'entrypoint' => env('AI_WORKER_ENTRYPOINT') ?: base_path('ai-worker/worker.py'),
    'timeout' => (int) env('AI_WORKER_TIMEOUT', 300),
    'idle_timeout' => (int) env('AI_WORKER_IDLE_TIMEOUT', 60),
];
