<?php

return [
    'recordings' => [
        'disk' => env('PRACTICE_RECORDINGS_DISK', 'local'),
        'max_audio_kb' => (int) env('PRACTICE_RECORDINGS_MAX_AUDIO_KB', 51200),
    ],
];
