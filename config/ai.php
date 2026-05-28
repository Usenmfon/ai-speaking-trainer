<?php

return [
    'transcription' => [
        // The MVP keeps transcription in the isolated Python worker.
        // The worker may use OpenAI or another provider internally.
        'provider' => env('AI_TRANSCRIPTION_PROVIDER', 'python_worker'),
    ],

    'feedback' => [
        'provider' => env('AI_FEEDBACK_PROVIDER', env('SPEAKING_FEEDBACK_PROVIDER', 'local')),
    ],
];
