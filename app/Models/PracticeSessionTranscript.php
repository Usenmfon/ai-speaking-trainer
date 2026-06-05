<?php

namespace App\Models;

use Database\Factories\PracticeSessionTranscriptFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[UseFactory(PracticeSessionTranscriptFactory::class)]
#[Fillable([
    'practice_session_id',
    'user_id',
    'practice_session_recording_id',
    'text',
    'segments',
    'provider',
    'completed_at',
])]
class PracticeSessionTranscript extends Model
{
    /** @use HasFactory<PracticeSessionTranscriptFactory> */
    use HasFactory, HasUuids;

    public $timestamps = false;

    /**
     * Get the practice session for this transcript.
     *
     * @return BelongsTo<PracticeSession, $this>
     */
    public function practiceSession(): BelongsTo
    {
        return $this->belongsTo(PracticeSession::class);
    }

    /**
     * Get the recording this transcript was generated from.
     *
     * @return BelongsTo<PracticeSessionRecording, $this>
     */
    public function recording(): BelongsTo
    {
        return $this->belongsTo(PracticeSessionRecording::class, 'practice_session_recording_id');
    }

    /**
     * Get the user that owns this transcript.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the feedback report for this transcript.
     *
     * @return HasOne<SpeakingFeedbackReport, $this>
     */
    public function feedbackReport(): HasOne
    {
        return $this->hasOne(SpeakingFeedbackReport::class, 'transcript_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'segments' => 'array',
            'completed_at' => 'datetime',
        ];
    }
}
