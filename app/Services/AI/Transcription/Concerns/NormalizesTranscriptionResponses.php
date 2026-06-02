<?php

namespace App\Services\AI\Transcription\Concerns;

use RuntimeException;

trait NormalizesTranscriptionResponses
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeOpenAiCompatibleResponse(array $payload, string $provider, string $model): array
    {
        $transcript = trim((string) ($payload['text'] ?? ''));

        if ($transcript === '') {
            throw new RuntimeException("{$provider} returned an empty transcript.");
        }

        return [
            'success' => true,
            'transcript' => $transcript,
            'text' => $transcript,
            'language' => $payload['language'] ?? null,
            'duration_seconds' => $payload['duration'] ?? null,
            'segments' => $this->normalizeSegments($payload['segments'] ?? null),
            'provider' => $provider,
            'model' => $model,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function normalizeSegments(mixed $rawSegments): array
    {
        if (! is_array($rawSegments)) {
            return [];
        }

        return collect($rawSegments)
            ->filter(fn (mixed $segment): bool => is_array($segment))
            ->map(fn (array $segment): array => [
                'id' => $segment['id'] ?? null,
                'start' => $segment['start'] ?? null,
                'end' => $segment['end'] ?? null,
                'text' => $segment['text'] ?? null,
            ])
            ->values()
            ->all();
    }

    private function audioMimeType(string $audioPath): string
    {
        return match (strtolower(pathinfo($audioPath, PATHINFO_EXTENSION))) {
            'aac' => 'audio/aac',
            'flac' => 'audio/flac',
            'm4a', 'mp4' => 'audio/mp4',
            'mp3', 'mpeg', 'mpga' => 'audio/mpeg',
            'oga', 'ogg' => 'audio/ogg',
            'opus' => 'audio/opus',
            'wav' => 'audio/wav',
            'webm' => 'audio/webm',
            default => mime_content_type($audioPath) ?: 'application/octet-stream',
        };
    }
}
