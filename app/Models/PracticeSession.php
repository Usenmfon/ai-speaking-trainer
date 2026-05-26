<?php

namespace App\Models;

use Database\Factories\PracticeSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[UseFactory(PracticeSessionFactory::class)]
#[Fillable([
    'user_id',
    'title',
    'topic',
    'session_type',
    'target_duration_seconds',
    'objective',
    'status',
    'started_at',
    'completed_at',
])]
class PracticeSession extends Model
{
    use HasUuids;

    public const SessionTypes = [
        'presentation',
        'interview',
        'storytelling',
        'elevator_pitch',
        'impromptu',
    ];

    public const Statuses = [
        'draft',
        'recorded',
        'transcribing',
        'transcribed',
        'analyzing',
        'analyzed',
        'failed',
    ];

    /**
     * Get the user that owns the practice session.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the recording for this practice session.
     *
     * @return HasOne<PracticeSessionRecording, $this>
     */
    public function recording(): HasOne
    {
        return $this->hasOne(PracticeSessionRecording::class);
    }

    /**
     * Get the transcript for this practice session.
     *
     * @return HasOne<PracticeSessionTranscript, $this>
     */
    public function transcript(): HasOne
    {
        return $this->hasOne(PracticeSessionTranscript::class);
    }

    /**
     * Get the speaking feedback report for this practice session.
     *
     * @return HasOne<SpeakingFeedbackReport, $this>
     */
    public function feedbackReport(): HasOne
    {
        return $this->hasOne(SpeakingFeedbackReport::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
