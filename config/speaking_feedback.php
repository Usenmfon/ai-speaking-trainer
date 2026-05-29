<?php

return [
    'provider' => env('AI_FEEDBACK_PROVIDER', env('SPEAKING_FEEDBACK_PROVIDER', 'local')),
    'endpoint' => env('SPEAKING_FEEDBACK_ENDPOINT'),
    'api_key' => env('AI_FEEDBACK_API_KEY', env('SPEAKING_FEEDBACK_API_KEY', env('OPENAI_API_KEY'))),
    'timeout' => (int) env('AI_FEEDBACK_TIMEOUT', env('SPEAKING_FEEDBACK_TIMEOUT', 60)),
    'openai' => [
        'endpoint' => env('OPENAI_FEEDBACK_ENDPOINT', 'https://api.openai.com/v1/chat/completions'),
        'model' => env('OPENAI_FEEDBACK_MODEL', 'gpt-4o-mini'),
    ],
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY', env('GOOGLE_API_KEY')),
        'endpoint' => env('GEMINI_FEEDBACK_ENDPOINT', 'https://generativelanguage.googleapis.com/v1beta'),
        'model' => env('GEMINI_FEEDBACK_MODEL', 'gemini-2.5-flash'),
        'temperature' => env('GEMINI_FEEDBACK_TEMPERATURE', 0.3),
    ],
    'grok' => [
        'api_key' => env('XAI_API_KEY', env('GROK_API_KEY')),
        'endpoint' => env('GROK_FEEDBACK_ENDPOINT', 'https://api.x.ai/v1/chat/completions'),
        'model' => env('GROK_FEEDBACK_MODEL', 'grok-4.3'),
        'temperature' => env('GROK_FEEDBACK_TEMPERATURE', 0.3),
    ],
    'groq' => [
        'api_key' => env('GROQ_API_KEY'),
        'endpoint' => env('GROQ_FEEDBACK_ENDPOINT', 'https://api.groq.com/openai/v1/chat/completions'),
        'model' => env('GROQ_FEEDBACK_MODEL', 'llama-3.3-70b-versatile'),
        'temperature' => env('GROQ_FEEDBACK_TEMPERATURE', 0.3),
    ],
];
