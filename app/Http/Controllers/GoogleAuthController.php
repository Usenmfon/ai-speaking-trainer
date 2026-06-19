<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Notifications\PracticeSessionsAwarded;
use App\Services\PracticeSessionCreditService;
use App\Services\ReferralService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Two\User as SocialiteUser;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class GoogleAuthController extends Controller
{
    public function __construct(
        private readonly ReferralService $referrals,
        private readonly PracticeSessionCreditService $credits,
    ) {}

    /**
     * Redirect the user to Google for authentication.
     */
    public function redirect(): SymfonyRedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the Google authentication callback.
     */
    public function callback(Request $request): RedirectResponse
    {
        if ($request->filled('error')) {
            return to_route('login')->withErrors([
                'email' => 'Google authentication was cancelled.',
            ]);
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (InvalidStateException) {
            return to_route('login')->withErrors([
                'email' => 'Google authentication could not be verified. Please try again.',
            ]);
        }

        $email = $googleUser->getEmail();
        $googleId = $googleUser->getId();

        if (! $email || ! $googleId) {
            return to_route('login')->withErrors([
                'email' => 'Google did not provide the account details required to sign in.',
            ]);
        }

        $user = $this->findOrCreateUser($googleUser, $email, $googleId);

        if ($user->wasRecentlyCreated) {
            $this->credits->recordInitialGrant($user);

            $user->notify(new PracticeSessionsAwarded(
                User::InitialFreePracticeSessions,
                $user->practice_sessions_remaining,
                'welcome',
            ));

            $this->referrals->recordSignup(
                $user,
                $request->session()->pull('referral_code'),
            );
        }

        Auth::login($user);
        $request->session()->regenerate();

        return $this->redirectAfterLogin($user);
    }

    /**
     * Find an existing user or create one from the Google account.
     */
    private function findOrCreateUser(SocialiteUser $googleUser, string $email, string $googleId): User
    {
        $user = User::query()->where('google_id', $googleId)->first()
            ?? User::query()->where('email', $email)->first();

        if (! $user) {
            /** @var User $user */
            $user = User::query()->create([
                'name' => $googleUser->getName() ?: Str::before($email, '@'),
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::password(32)),
                'google_id' => $googleId,
                'google_avatar' => $googleUser->getAvatar(),
            ]);

            $user->assignRole(Role::findOrCreate('user', 'web'));

            return $user;
        }

        $user->forceFill([
            'name' => $user->name ?: ($googleUser->getName() ?: Str::before($email, '@')),
            'email_verified_at' => $user->email_verified_at ?? now(),
            'google_id' => $googleId,
            'google_avatar' => $googleUser->getAvatar(),
        ])->save();

        return $user;
    }

    /**
     * Redirect authenticated users to the correct app area.
     */
    private function redirectAfterLogin(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return to_route('admin.dashboard');
        }

        if (! $user->profile?->onboarding_completed) {
            return to_route('user-profile.complete');
        }

        return to_route('dashboard');
    }
}
