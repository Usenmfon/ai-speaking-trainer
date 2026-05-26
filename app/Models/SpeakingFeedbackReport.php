<?php

namespace App\Models;

use Database\Factories\SpeakingFeedbackReportFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UseFactory(SpeakingFeedbackReportFactory::class)]
#[Fillable([
    'practice_session_id',
    'user_id',
    'transcript_id',
    'overall_score',
    'clarity_score',
    'structure_score',
    'confidence_score',
    'pace_score',
    'filler_word_score',
    'summary_feedback',
    'strengths',
    'weaknesses',
    'recommendations',
    'filler_words',
    'improved_version',
    'status',
    'error_message',
    'processed_at',
])]
class SpeakingFeedbackReport extends Model
{
    use HasUuids;

    public const Statuses = [
        'pending',
        'processing',
        'completed',
        'failed',
    ];

    /**
     * Get the practice session for this report.
     *
     * @return BelongsTo<PracticeSession, $this>
     */
    public function practiceSession(): BelongsTo
    {
        return $this->belongsTo(PracticeSession::class);
    }

    /**
     * Get the user that owns this report.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transcript this report analyzes.
     *
     * @return BelongsTo<PracticeSessionTranscript, $this>
     */
    public function transcript(): BelongsTo
    {
        return $this->belongsTo(PracticeSessionTranscript::class, 'transcript_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'overall_score' => 'integer',
            'clarity_score' => 'integer',
            'structure_score' => 'integer',
            'confidence_score' => 'integer',
            'pace_score' => 'integer',
            'filler_word_score' => 'integer',
            'strengths' => 'array',
            'weaknesses' => 'array',
            'recommendations' => 'array',
            'filler_words' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}
