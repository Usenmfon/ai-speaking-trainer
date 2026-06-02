<?php

namespace App\Services\AI\Transcription;

use App\Contracts\AI\TranscriptionProvider;
use RuntimeException;

class LocalTranscriptionProvider implements TranscriptionProvider
{
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
        $transcript = trim((string) config('ai.transcription.local.text'));

        if ($transcript === '') {
            throw new RuntimeException('LOCAL_TRANSCRIPTION_TEXT cannot be empty.');
        }

        return [
            'success' => true,
            'transcript' => $transcript,
            'text' => $transcript,
            'language' => (string) config('ai.transcription.local.language'),
            'duration_seconds' => null,
            'segments' => [],
            'provider' => 'local',
            'model' => 'placeholder',
        ];
    }
}
