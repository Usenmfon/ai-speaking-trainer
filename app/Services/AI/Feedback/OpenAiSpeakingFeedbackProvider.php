<?php

namespace App\Services\AI\Feedback;

use App\Contracts\AI\SpeakingFeedbackProvider;
use App\Models\PracticeSessionTranscript;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAiSpeakingFeedbackProvider implements SpeakingFeedbackProvider
{
    public function analyze(PracticeSessionTranscript $transcript, string $prompt): string
    {
        $apiKey = config('speaking_feedback.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('OPENAI_API_KEY or SPEAKING_FEEDBACK_API_KEY is required when AI_FEEDBACK_PROVIDER=openai.');
        }

        $response = Http::acceptJson()
            ->withToken($apiKey)
            ->timeout(config('speaking_feedback.timeout'))
            ->retry(2, 500)
            ->post(config('speaking_feedback.openai.endpoint'), [
                'model' => config('speaking_feedback.openai.model'),
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert AI speaking coach. Return only valid JSON matching the requested schema.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
            ])->throw();

        $content = $response->json('choices.0.message.content');

        if (! is_string($content) || trim($content) === '') {
            throw new RuntimeException('OpenAI feedback response did not include JSON content.');
        }

        return $content;
    }
}
