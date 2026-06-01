<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'email_verified_at', 'password', 'google_id', 'google_avatar'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['is_admin'];

    /**
     * Bootstrap the model's events.
     */
    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            $user->public_id ??= (string) Str::uuid7();
        });
    }

    /**
     * Get the user's AI speaking coach profile.
     *
     * @return HasOne<UserProfile, $this>
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Get the user's practice sessions.
     *
     * @return HasMany<PracticeSession, $this>
     */
    public function practiceSessions(): HasMany
    {
        return $this->hasMany(PracticeSession::class);
    }

    /**
     * Get the user's uploaded practice session recordings.
     *
     * @return HasMany<PracticeSessionRecording, $this>
     */
    public function practiceSessionRecordings(): HasMany
    {
        return $this->hasMany(PracticeSessionRecording::class);
    }

    /**
     * Get the user's practice session transcripts.
     *
     * @return HasMany<PracticeSessionTranscript, $this>
     */
    public function practiceSessionTranscripts(): HasMany
    {
        return $this->hasMany(PracticeSessionTranscript::class);
    }

    /**
     * Get the user's speaking feedback reports.
     *
     * @return HasMany<SpeakingFeedbackReport, $this>
     */
    public function speakingFeedbackReports(): HasMany
    {
        return $this->hasMany(SpeakingFeedbackReport::class);
    }

    /**
     * Determine whether the user can access admin tools.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Get the admin flag exposed to Inertia.
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
