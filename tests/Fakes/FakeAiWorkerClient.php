<?php

namespace Tests\Fakes;

use App\Contracts\AI\TranscriptionProvider;
use App\Exceptions\AiWorkerException;
use App\Services\AiWorker\AiWorkerClient;
use RuntimeException;
use Throwable;

class FakeAiWorkerClient extends AiWorkerClient implements TranscriptionProvider
{
    /**
     * @param  array{ok: bool, task?: string, data?: array<string, mixed>, errors?: array<int, array<string, string>>, meta?: array<string, mixed>}|Throwable  $response
     */
    public function __construct(private readonly array|Throwable $response) {}

    /**
     * Process a practice session recording without calling Python.
     *
     * @param  array<string, mixed>  $metadata
     * @return array{ok: bool, task: string, data: array<string, mixed>, errors: array<int, array<string, string>>, meta: array<string, mixed>}
     *
     * @throws Throwable
     */
    public function processRecording(
        string $audioPath,
        string $sessionId,
        string $recordingId,
        array $metadata = [],
    ): array {
        if ($this->response instanceof Throwable) {
            throw $this->response;
        }

        if ($this->response['ok'] !== true) {
            throw AiWorkerException::failed(
                $this->response['errors'][0]['message'] ?? 'AI worker failed.',
            );
        }

        return [
            'ok' => true,
            'task' => $this->response['task'] ?? 'process_recording',
            'data' => $this->response['data'] ?? [],
            'errors' => $this->response['errors'] ?? [],
            'meta' => $this->response['meta'] ?? [],
        ];
    }

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
        $response = $this->processRecording($audioPath, $sessionId, $recordingId, $metadata);
        $transcription = $response['data']['transcription'] ?? null;

        if (! is_array($transcription)) {
            throw new RuntimeException('Transcription provider returned an invalid response.');
        }

        return $transcription;
    }

    /**
     * @param  array<int, array<string, mixed>>  $segments
     */
    public static function transcript(string $text, array $segments = []): self
    {
        return new self([
            'ok' => true,
            'task' => 'process_recording',
            'data' => [
                'transcription' => [
                    'transcript' => $text,
                    'language' => 'en',
                    'duration_seconds' => 42,
                    'segments' => $segments,
                    'provider' => 'openai',
                    'model' => 'whisper-1',
                ],
            ],
            'errors' => [],
            'meta' => [],
        ]);
    }

    public static function failure(string $message): self
    {
        return new self([
            'ok' => false,
            'task' => 'process_recording',
            'data' => [],
            'errors' => [
                ['message' => $message],
            ],
            'meta' => [],
        ]);
    }

    public static function invalidJson(string $output = '{not-json'): self
    {
        return new self(AiWorkerException::invalidJson($output));
    }
}
