<?php

namespace App\Models;

use Database\Factories\UserProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UseFactory(UserProfileFactory::class)]
#[Fillable([
    'user_id',
    'full_name',
    'speaking_level',
    'main_goal',
    'preferred_language',
    'bio',
    'onboarding_completed',
])]
class UserProfile extends Model
{
    public const SpeakingLevels = [
        'beginner',
        'intermediate',
        'advanced',
    ];

    public const MainGoals = [
        'public_speaking',
        'interviews',
        'presentations',
        'storytelling',
        'confidence',
        'pronunciation',
    ];

    /**
     * Get the user that owns the profile.
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
            'onboarding_completed' => 'boolean',
        ];
    }
}
