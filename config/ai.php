<?php

return [
    'transcription' => [
        'provider' => env('AI_TRANSCRIPTION_PROVIDER', 'openai'),
        'timeout' => (int) env('AI_TRANSCRIPTION_TIMEOUT', 120),
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'endpoint' => env('OPENAI_TRANSCRIPTION_ENDPOINT', 'https://api.openai.com/v1/audio/transcriptions'),
            'model' => env('OPENAI_TRANSCRIPTION_MODEL', 'whisper-1'),
            'temperature' => env('OPENAI_TRANSCRIPTION_TEMPERATURE', 0),
        ],
        'gemini' => [
            'api_key' => env('GEMINI_API_KEY', env('GOOGLE_API_KEY')),
            'endpoint' => env('GEMINI_TRANSCRIPTION_ENDPOINT', 'https://generativelanguage.googleapis.com/v1beta'),
            'model' => env('GEMINI_TRANSCRIPTION_MODEL', 'gemini-2.5-flash'),
            'prompt' => env('GEMINI_TRANSCRIPTION_PROMPT', 'Transcribe this audio exactly. Return only the transcript text.'),
            'temperature' => env('GEMINI_TRANSCRIPTION_TEMPERATURE', 0),
        ],
        'grok' => [
            'api_key' => env('XAI_API_KEY', env('GROK_API_KEY')),
            'endpoint' => env('XAI_TRANSCRIPTION_ENDPOINT', env('GROK_TRANSCRIPTION_ENDPOINT', 'https://api.x.ai/v1/stt')),
            'model' => env('XAI_TRANSCRIPTION_MODEL', env('GROK_TRANSCRIPTION_MODEL', 'grok-speech-to-text')),
            'language' => env('XAI_TRANSCRIPTION_LANGUAGE', env('GROK_TRANSCRIPTION_LANGUAGE')),
            'format' => env('XAI_TRANSCRIPTION_FORMAT', env('GROK_TRANSCRIPTION_FORMAT')),
            'diarize' => env('XAI_TRANSCRIPTION_DIARIZE', env('GROK_TRANSCRIPTION_DIARIZE')),
            'filler_words' => env('XAI_TRANSCRIPTION_FILLER_WORDS', env('GROK_TRANSCRIPTION_FILLER_WORDS')),
        ],
        'groq' => [
            'api_key' => env('GROQ_API_KEY'),
            'endpoint' => env('GROQ_TRANSCRIPTION_ENDPOINT', 'https://api.groq.com/openai/v1/audio/transcriptions'),
            'model' => env('GROQ_TRANSCRIPTION_MODEL', 'whisper-large-v3-turbo'),
        ],
        'local' => [
            'text' => env('LOCAL_TRANSCRIPTION_TEXT', 'Local placeholder transcript. Configure a real transcription provider before using this in production.'),
            'language' => env('LOCAL_TRANSCRIPTION_LANGUAGE', 'en'),
        ],
    ],

    'feedback' => [
        'provider' => env('AI_FEEDBACK_PROVIDER', env('SPEAKING_FEEDBACK_PROVIDER', 'openai')),
    ],
];
