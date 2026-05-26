<?php

namespace App\Models;

use Database\Factories\PracticeSessionRecordingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UseFactory(PracticeSessionRecordingFactory::class)]
#[Fillable([
    'practice_session_id',
    'user_id',
    'audio_path',
    'original_filename',
    'mime_type',
    'size',
    'duration_seconds',
    'uploaded_at',
])]
class PracticeSessionRecording extends Model
{
    use HasUuids;

    public $timestamps = false;

    /**
     * Get the practice session this recording belongs to.
     *
     * @return BelongsTo<PracticeSession, $this>
     */
    public function practiceSession(): BelongsTo
    {
        return $this->belongsTo(PracticeSession::class);
    }

    /**
     * Get the user that owns the recording.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'uploaded_at' => 'datetime',
        ];
    }
}
