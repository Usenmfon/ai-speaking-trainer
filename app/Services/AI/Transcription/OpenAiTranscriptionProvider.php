<?php

namespace App\Services\AI\Transcription;

use App\Contracts\AI\TranscriptionProvider;
use App\Services\AI\Transcription\Concerns\NormalizesTranscriptionResponses;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OpenAiTranscriptionProvider implements TranscriptionProvider
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
        $apiKey = config('ai.transcription.openai.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('OPENAI_API_KEY is required when AI_TRANSCRIPTION_PROVIDER=openai.');
        }

        $model = (string) config('ai.transcription.openai.model');
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
            ->post(config('ai.transcription.openai.endpoint'), [
                'model' => $model,
                'response_format' => 'verbose_json',
                'temperature' => (float) config('ai.transcription.openai.temperature'),
            ])
            ->throw();

        return $this->normalizeOpenAiCompatibleResponse($response->json(), 'openai', $model);
    }
}
