<?php

namespace App\Contracts\AI;

interface TranscriptionProvider
{
    /**
     * Transcribe a prepared local audio path and return normalized transcript data.
     *
     * @param  array<string, mixed>  $metadata
     * @return array<string, mixed>
     */
    public function transcribeRecording(
        string $audioPath,
        string $sessionId,
        string $recordingId,
        array $metadata = [],
    ): array;
}
