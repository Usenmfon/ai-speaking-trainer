<?php

namespace App\Services\AI\Transcription;

use App\Contracts\AI\TranscriptionProvider;
use App\Services\AiWorker\AiWorkerClient;
use RuntimeException;

class PythonWorkerTranscriptionProvider implements TranscriptionProvider
{
    public function __construct(private AiWorkerClient $worker) {}

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
        $response = $this->worker->processRecording(
            audioPath: $audioPath,
            sessionId: $sessionId,
            recordingId: $recordingId,
            metadata: $metadata,
        );

        $transcription = $response['data']['transcription'] ?? null;

        if (! is_array($transcription)) {
            throw new RuntimeException('Transcription provider returned an invalid response.');
        }

        return $transcription;
    }
}
