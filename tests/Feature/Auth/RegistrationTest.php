<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\QueuedVerifyEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        Notification::fake();

        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $user = User::query()->where('email', 'test@example.com')->firstOrFail();

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertFalse($user->hasVerifiedEmail());
        Notification::assertSentTo($user, QueuedVerifyEmail::class);
    }

    public function test_unverified_email_password_users_are_redirected_to_verification_notice(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Unverified User',
            'email' => 'unverified@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->get(route('dashboard'))
            ->assertRedirect(route('verification.notice', absolute: false));
    }

    public function test_verification_notification_is_queued(): void
    {
        $this->assertInstanceOf(ShouldQueue::class, new QueuedVerifyEmail);
    }
}
