<?php

return [
    'site_name' => env('SEO_SITE_NAME', 'SpeakAI Coach'),
    'title' => env('SEO_TITLE', 'AI Speaking Coach for Presentations, Interviews, and Public Speaking'),
    'description' => env('SEO_DESCRIPTION', 'Practice speeches, presentations, interviews, and conversations with AI feedback on clarity, confidence, pronunciation, pacing, and filler words.'),
    'keywords' => [
        'AI speaking coach',
        'public speaking practice',
        'presentation rehearsal',
        'interview practice',
        'speech feedback',
        'pronunciation feedback',
    ],
    'image' => env('SEO_IMAGE', '/apple-touch-icon.png'),
    'indexable_routes' => [
        'home',
    ],
];
