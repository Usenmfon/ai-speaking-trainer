<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_be_redirected_to_google(): void
    {
        Socialite::fake('google');

        $response = $this->get(route('auth.google.redirect'));

        $response->assertRedirect();
    }

    public function test_google_callback_creates_and_authenticates_user(): void
    {
        Socialite::fake('google', (new SocialiteUser)->map([
            'id' => 'google-123',
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'avatar' => 'https://example.com/avatar.jpg',
        ]));

        $response = $this->get(route('auth.google.callback'));

        $user = User::query()->where('email', 'ada@example.com')->firstOrFail();

        $this->assertAuthenticatedAs($user);
        $this->assertTrue($user->hasRole('user'));
        $response->assertRedirect(route('user-profile.complete', absolute: false));
        $this->assertSame('google-123', $user->google_id);
        $this->assertSame('https://example.com/avatar.jpg', $user->google_avatar);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_google_callback_links_existing_email_account(): void
    {
        $user = User::factory()->create([
            'email' => 'existing@example.com',
            'google_id' => null,
            'google_avatar' => null,
        ]);
        UserProfile::factory()->for($user)->create();

        Socialite::fake('google', (new SocialiteUser)->map([
            'id' => 'google-existing',
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'avatar' => 'https://example.com/existing.jpg',
        ]));

        $response = $this->get(route('auth.google.callback'));

        $user->refresh();

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertSame('google-existing', $user->google_id);
        $this->assertSame('https://example.com/existing.jpg', $user->google_avatar);
    }

    public function test_google_callback_returns_to_login_when_cancelled(): void
    {
        $response = $this->get(route('auth.google.callback', ['error' => 'access_denied']));

        $this->assertGuest();
        $response->assertRedirect(route('login', absolute: false));
        $response->assertSessionHasErrors('email');
    }
}
