<?php

namespace App\Contracts\AI;

use App\Models\PracticeSessionTranscript;

interface SpeakingFeedbackProvider
{
    /**
     * Return raw JSON feedback for a completed transcript.
     */
    public function analyze(PracticeSessionTranscript $transcript, string $prompt): string;
}
