<?php

namespace Tests\Fakes;

use App\Contracts\AI\TranscriptionProvider;
use RuntimeException;
use Throwable;

class FakeTranscriptionProvider implements TranscriptionProvider
{
    /**
     * @param  array<string, mixed>|Throwable  $response
     */
    public function __construct(private readonly array|Throwable $response) {}

    /**
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>
     *
     * @throws Throwable
     */
    public function transcribeRecording(
        string $audioPath,
        string $sessionId,
        string $recordingId,
        array $metadata = [],
    ): array {
        if ($this->response instanceof Throwable) {
            throw $this->response;
        }

        return $this->response;
    }

    /**
     * @param  array<int, array<string, mixed>>  $segments
     */
    public static function transcript(string $text, array $segments = []): self
    {
        return new self([
            'transcript' => $text,
            'language' => 'en',
            'duration_seconds' => 42,
            'segments' => $segments,
            'provider' => 'openai',
            'model' => 'whisper-1',
        ]);
    }

    public static function failure(string $message): self
    {
        return new self(new RuntimeException($message));
    }

    public static function invalidResponse(): self
    {
        return new self(new RuntimeException('Transcription provider returned an invalid response.'));
    }
}
