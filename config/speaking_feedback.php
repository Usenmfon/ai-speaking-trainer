<?php

return [
    'provider' => env('SPEAKING_FEEDBACK_PROVIDER', 'local'),
    'endpoint' => env('SPEAKING_FEEDBACK_ENDPOINT'),
    'api_key' => env('SPEAKING_FEEDBACK_API_KEY', env('OPENAI_API_KEY')),
    'timeout' => (int) env('SPEAKING_FEEDBACK_TIMEOUT', 60),
];
