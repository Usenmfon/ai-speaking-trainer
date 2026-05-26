<?php

return [
    'root' => base_path('ai-worker'),
    'python' => env('AI_WORKER_PYTHON', base_path('ai-worker/.venv/Scripts/python.exe')),
    'entrypoint' => env('AI_WORKER_ENTRYPOINT', base_path('ai-worker/worker.py')),
    'timeout' => (int) env('AI_WORKER_TIMEOUT', 300),
    'idle_timeout' => (int) env('AI_WORKER_IDLE_TIMEOUT', 60),
];
