<?php

namespace App\Services\AI\Feedback;

use App\Contracts\AI\SpeakingFeedbackProvider;
use App\Models\PracticeSessionTranscript;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GrokSpeakingFeedbackProvider implements SpeakingFeedbackProvider
{
    public function analyze(PracticeSessionTranscript $transcript, string $prompt): string
    {
        $apiKey = config('speaking_feedback.grok.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('XAI_API_KEY or GROK_API_KEY is required when AI_FEEDBACK_PROVIDER=grok.');
        }

        $response = Http::acceptJson()
            ->withToken($apiKey)
            ->timeout(config('speaking_feedback.timeout'))
            ->retry(2, 500)
            ->post(config('speaking_feedback.grok.endpoint'), [
                'model' => config('speaking_feedback.grok.model'),
                'temperature' => (float) config('speaking_feedback.grok.temperature'),
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
            throw new RuntimeException('Grok feedback response did not include JSON content.');
        }

        return $content;
    }
}
