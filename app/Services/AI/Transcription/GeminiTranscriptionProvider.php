<?php

namespace App\Services\AI\Transcription;

use App\Contracts\AI\TranscriptionProvider;
use App\Services\AI\Transcription\Concerns\NormalizesTranscriptionResponses;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiTranscriptionProvider implements TranscriptionProvider
{
    use NormalizesTranscriptionResponses;

    /**
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>
     */
    public function transcribeRecording(
        string $audioPath,
        string $sessionId,
        string $recordingId,
        array $metadata = [],
    ): array {
        $apiKey = config('ai.transcription.gemini.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('GEMINI_API_KEY is required when AI_TRANSCRIPTION_PROVIDER=gemini.');
        }

        $model = (string) config('ai.transcription.gemini.model');
        $response = Http::acceptJson()
            ->withHeaders(['x-goog-api-key' => $apiKey])
            ->timeout(config('ai.transcription.timeout'))
            ->retry(2, 500)
            ->post($this->generateContentUrl(), [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => (string) config('ai.transcription.gemini.prompt')],
                            [
                                'inline_data' => [
                                    'mime_type' => $this->audioMimeType($audioPath),
                                    'data' => base64_encode((string) file_get_contents($audioPath)),
                                ],
                            ],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => (float) config('ai.transcription.gemini.temperature'),
                ],
            ])
            ->throw();

        $parts = $response->json('candidates.0.content.parts');

        if (! is_array($parts)) {
            $blockReason = $response->json('promptFeedback.blockReason');

            throw new RuntimeException(
                is_string($blockReason)
                    ? "Gemini transcription response was blocked: {$blockReason}."
                    : 'Gemini transcription response did not include generated content.',
            );
        }

        $transcript = collect($parts)
            ->pluck('text')
            ->filter(fn (mixed $text): bool => is_string($text) && trim($text) !== '')
            ->implode('');

        if (trim($transcript) === '') {
            throw new RuntimeException('Gemini returned an empty transcript.');
        }

        return [
            'success' => true,
            'transcript' => $transcript,
            'text' => $transcript,
            'language' => null,
            'duration_seconds' => null,
            'segments' => [],
            'provider' => 'gemini',
            'model' => $model,
        ];
    }

    private function generateContentUrl(): string
    {
        $endpoint = rtrim((string) config('ai.transcription.gemini.endpoint'), '/');
        $model = trim((string) config('ai.transcription.gemini.model'), '/');
        $modelPath = str_starts_with($model, 'models/') ? $model : "models/{$model}";

        return "{$endpoint}/{$modelPath}:generateContent";
    }
}
