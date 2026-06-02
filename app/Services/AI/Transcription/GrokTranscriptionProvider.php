<?php

namespace App\Services\AI\Transcription;

use App\Contracts\AI\TranscriptionProvider;
use App\Services\AI\Transcription\Concerns\NormalizesTranscriptionResponses;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GrokTranscriptionProvider implements TranscriptionProvider
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
        $apiKey = config('ai.transcription.grok.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('XAI_API_KEY or GROK_API_KEY is required when AI_TRANSCRIPTION_PROVIDER=grok.');
        }

        $audio = file_get_contents($audioPath);

        if ($audio === false) {
            throw new RuntimeException('Unable to read audio file for transcription.');
        }

        $response = Http::acceptJson()
            ->withToken($apiKey)
            ->timeout(config('ai.transcription.timeout'))
            ->retry(2, 500)
            ->attach('file', $audio, basename($audioPath), [
                'Content-Type' => $this->audioMimeType($audioPath),
            ])
            ->post(config('ai.transcription.grok.endpoint'), array_filter([
                'language' => config('ai.transcription.grok.language'),
                'format' => config('ai.transcription.grok.format'),
                'diarize' => config('ai.transcription.grok.diarize'),
                'filler_words' => config('ai.transcription.grok.filler_words'),
            ], fn (mixed $value): bool => $value !== null && $value !== ''))
            ->throw();

        return $this->normalizeGrokResponse($response->json());
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeGrokResponse(array $payload): array
    {
        $transcript = trim((string) ($payload['text'] ?? ''));

        if ($transcript === '') {
            throw new RuntimeException('Grok returned an empty transcript.');
        }

        return [
            'success' => true,
            'transcript' => $transcript,
            'text' => $transcript,
            'language' => $payload['language'] ?? null,
            'duration_seconds' => $payload['duration'] ?? null,
            'segments' => $payload['words'] ?? [],
            'provider' => 'grok',
            'model' => (string) config('ai.transcription.grok.model'),
        ];
    }
}
