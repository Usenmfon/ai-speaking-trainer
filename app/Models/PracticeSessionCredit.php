<?php

namespace App\Models;

use Database\Factories\PracticeSessionCreditFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[UseFactory(PracticeSessionCreditFactory::class)]
#[Fillable([
    'user_id',
    'actor_id',
    'practice_session_id',
    'referral_id',
    'type',
    'amount',
    'balance_after',
    'note',
    'metadata',
])]
class PracticeSessionCredit extends Model
{
    /** @use HasFactory<PracticeSessionCreditFactory> */
    use HasFactory;

    public const TypeInitialGrant = 'initial_grant';

    public const TypeAdminGrant = 'admin_grant';

    public const TypeReferralReward = 'referral_reward';

    public const TypeSessionCreated = 'session_created';

    public const TypeLegacyBalance = 'legacy_balance';

    /**
     * Get the user whose credit balance changed.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin or system actor that created the entry.
     *
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Get the practice session that consumed the credit.
     *
     * @return BelongsTo<PracticeSession, $this>
     */
    public function practiceSession(): BelongsTo
    {
        return $this->belongsTo(PracticeSession::class);
    }

    /**
     * Get the referral that awarded the credit.
     *
     * @return BelongsTo<Referral, $this>
     */
    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'balance_after' => 'integer',
            'metadata' => 'array',
        ];
    }
}
