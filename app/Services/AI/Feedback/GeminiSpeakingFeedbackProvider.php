<?php

namespace App\Services\AI\Feedback;

use App\Contracts\AI\SpeakingFeedbackProvider;
use App\Models\PracticeSessionTranscript;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiSpeakingFeedbackProvider implements SpeakingFeedbackProvider
{
    public function analyze(PracticeSessionTranscript $transcript, string $prompt): string
    {
        $apiKey = config('speaking_feedback.gemini.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('GEMINI_API_KEY is required when AI_FEEDBACK_PROVIDER=gemini.');
        }

        $response = Http::acceptJson()
            ->withHeaders([
                'x-goog-api-key' => $apiKey,
            ])
            ->timeout(config('speaking_feedback.timeout'))
            ->retry(2, 500)
            ->post($this->generateContentUrl(), [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            [
                                'text' => $prompt,
                            ],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => (float) config('speaking_feedback.gemini.temperature'),
                ],
            ])->throw();

        $parts = $response->json('candidates.0.content.parts');

        if (! is_array($parts)) {
            $blockReason = $response->json('promptFeedback.blockReason');

            throw new RuntimeException(
                is_string($blockReason)
                    ? "Gemini feedback response was blocked: {$blockReason}."
                    : 'Gemini feedback response did not include generated content.',
            );
        }

        $content = collect($parts)
            ->pluck('text')
            ->filter(fn (mixed $text): bool => is_string($text) && trim($text) !== '')
            ->implode('');

        if (trim($content) === '') {
            throw new RuntimeException('Gemini feedback response did not include JSON content.');
        }

        return $content;
    }

    private function generateContentUrl(): string
    {
        $endpoint = rtrim((string) config('speaking_feedback.gemini.endpoint'), '/');
        $model = trim((string) config('speaking_feedback.gemini.model'), '/');
        $modelPath = str_starts_with($model, 'models/') ? $model : "models/{$model}";

        return "{$endpoint}/{$modelPath}:generateContent";
    }
}
