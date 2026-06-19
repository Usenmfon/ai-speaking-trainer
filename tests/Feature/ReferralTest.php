<?php

namespace Tests\Feature;

use App\Models\PracticeSessionCredit;
use App\Models\Referral;
use App\Models\User;
use App\Models\UserProfile;
use App\Notifications\PracticeSessionsAwarded;
use App\Notifications\QueuedVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class ReferralTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_receive_a_referral_code_when_created(): void
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->referral_code);
        $this->assertSame(8, strlen($user->referral_code));
    }

    public function test_users_receive_five_free_practice_sessions_when_created(): void
    {
        $user = User::factory()->create();

        $this->assertSame(5, $user->practice_sessions_remaining);
    }

    public function test_referral_code_is_captured_from_query_string(): void
    {
        $referrer = User::factory()->create();

        $this->get(route('home', ['ref' => $referrer->referral_code]))
            ->assertSessionHas('referral_code', $referrer->referral_code);
    }

    public function test_normal_registration_still_works_without_a_referral(): void
    {
        Notification::fake();

        $response = $this->post(route('register.store'), [
            'name' => 'Plain Signup',
            'email' => 'plain@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'plain@example.com',
        ]);
        $this->assertDatabaseCount('referrals', 0);
        Notification::assertSentTo(
            User::query()->where('email', 'plain@example.com')->firstOrFail(),
            QueuedVerifyEmail::class,
        );
        Notification::assertSentTo(
            User::query()->where('email', 'plain@example.com')->firstOrFail(),
            fn (PracticeSessionsAwarded $notification): bool => $notification->sessionsAwarded === 5
                && $notification->sessionsRemaining === 5
                && $notification->reason === 'welcome',
        );
        $this->assertDatabaseHas('practice_session_credits', [
            'user_id' => User::query()->where('email', 'plain@example.com')->firstOrFail()->id,
            'type' => PracticeSessionCredit::TypeInitialGrant,
            'amount' => 5,
            'balance_after' => 5,
        ]);
    }

    public function test_registration_with_a_valid_referral_records_the_signup(): void
    {
        Notification::fake();

        $referrer = User::factory()->create();

        $this->withSession(['referral_code' => $referrer->referral_code])
            ->post(route('register.store'), [
                'name' => 'Referred Signup',
                'email' => 'referred@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertRedirect(route('dashboard', absolute: false));

        $referredUser = User::query()->where('email', 'referred@example.com')->firstOrFail();

        $this->assertDatabaseHas('referrals', [
            'referrer_id' => $referrer->id,
            'referred_user_id' => $referredUser->id,
            'referral_code' => $referrer->referral_code,
            'status' => 'registered',
        ]);
        $this->assertSame(7, $referrer->fresh()->practice_sessions_remaining);
        $this->assertDatabaseHas('practice_session_credits', [
            'user_id' => $referredUser->id,
            'type' => PracticeSessionCredit::TypeInitialGrant,
            'amount' => 5,
            'balance_after' => 5,
        ]);
        $this->assertDatabaseHas('practice_session_credits', [
            'user_id' => $referrer->id,
            'type' => PracticeSessionCredit::TypeReferralReward,
            'amount' => 2,
            'balance_after' => 7,
        ]);
        $this->assertFalse(session()->has('referral_code'));
        Notification::assertSentTo($referredUser, QueuedVerifyEmail::class);
        Notification::assertSentTo(
            $referredUser,
            fn (PracticeSessionsAwarded $notification): bool => $notification->sessionsAwarded === 5
                && $notification->sessionsRemaining === 5
                && $notification->reason === 'welcome',
        );
        Notification::assertSentTo(
            $referrer,
            fn (PracticeSessionsAwarded $notification): bool => $notification->sessionsAwarded === 2
                && $notification->sessionsRemaining === 7
                && $notification->reason === 'referral',
        );
    }

    public function test_registration_with_an_invalid_referral_code_still_registers(): void
    {
        Notification::fake();

        $this->withSession(['referral_code' => 'UNKNOWN1'])
            ->post(route('register.store'), [
                'name' => 'Invalid Code',
                'email' => 'invalid-code@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'invalid-code@example.com',
        ]);
        $this->assertDatabaseCount('referrals', 0);
    }

    public function test_google_signup_records_a_valid_referral(): void
    {
        Notification::fake();

        $referrer = User::factory()->create();

        Socialite::fake('google', (new SocialiteUser)->map([
            'id' => 'google-referred',
            'name' => 'Google Referred',
            'email' => 'google-referred@example.com',
            'avatar' => 'https://example.com/referred.jpg',
        ]));

        $this->withSession(['referral_code' => $referrer->referral_code])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('user-profile.complete', absolute: false));

        $referredUser = User::query()->where('email', 'google-referred@example.com')->firstOrFail();

        $this->assertDatabaseHas('referrals', [
            'referrer_id' => $referrer->id,
            'referred_user_id' => $referredUser->id,
            'referral_code' => $referrer->referral_code,
            'status' => 'registered',
        ]);
        $this->assertSame(7, $referrer->fresh()->practice_sessions_remaining);
        $this->assertDatabaseHas('practice_session_credits', [
            'user_id' => $referredUser->id,
            'type' => PracticeSessionCredit::TypeInitialGrant,
            'amount' => 5,
            'balance_after' => 5,
        ]);
        $this->assertDatabaseHas('practice_session_credits', [
            'user_id' => $referrer->id,
            'type' => PracticeSessionCredit::TypeReferralReward,
            'amount' => 2,
            'balance_after' => 7,
        ]);
        Notification::assertSentTo(
            $referredUser,
            fn (PracticeSessionsAwarded $notification): bool => $notification->sessionsAwarded === 5
                && $notification->sessionsRemaining === 5
                && $notification->reason === 'welcome',
        );
        Notification::assertSentTo(
            $referrer,
            fn (PracticeSessionsAwarded $notification): bool => $notification->sessionsAwarded === 2
                && $notification->sessionsRemaining === 7
                && $notification->reason === 'referral',
        );
    }

    public function test_dashboard_includes_referral_link_and_registered_count(): void
    {
        $user = User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
        Referral::factory()->for($user, 'referrer')->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->component('dashboard')
                ->where('analytics.referrals.code', $user->referral_code)
                ->where('analytics.referrals.registeredCount', 1)
                ->where('analytics.referrals.link', route('register', ['ref' => $user->referral_code]))
            );
    }
}
