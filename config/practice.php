<?php

return [
    'recordings' => [
        'disk' => env('PRACTICE_RECORDINGS_DISK', 'local'),
        'max_audio_kb' => (int) env('PRACTICE_RECORDINGS_MAX_AUDIO_KB', 51200),
        'allowed_extensions' => [
            'webm',
            'mp3',
            'wav',
            'mpeg',
            'mpga',
            'ogg',
            'oga',
            'm4a',
            'mp4',
            'flac',
        ],
        'allowed_mime_types' => [
            'audio/webm',
            'video/webm',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/wave',
            'audio/mpeg',
            'audio/ogg',
            'application/ogg',
            'audio/mp4',
            'audio/m4a',
            'audio/x-m4a',
            'audio/flac',
            'audio/x-flac',
            'video/mp4',
        ],
    ],
];
