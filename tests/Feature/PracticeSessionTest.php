<?php

namespace Tests\Feature;

use App\Models\PracticeSession;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PracticeSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_shows_empty_session_history(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->get(route('practice-sessions.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Index')
                ->has('sessions', 0)
            );
    }

    public function test_index_shows_existing_session_history(): void
    {
        $user = $this->completedUser();

        PracticeSession::factory()
            ->for($user)
            ->create([
                'title' => 'Investor pitch rehearsal',
                'topic' => 'Q3 growth story',
                'session_type' => 'presentation',
            ]);

        $response = $this->actingAs($user)->get(route('practice-sessions.index'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Index')
                ->has('sessions', 1)
                ->where('sessions.0.title', 'Investor pitch rehearsal')
                ->where('sessions.0.topic', 'Q3 growth story')
                ->where('sessions.0.session_type', 'presentation')
            );
    }

    public function test_create_page_renders_setup_options(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->get(route('practice-sessions.create'));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Create')
                ->has('sessionTypes')
                ->has('durations')
                ->has('topicSuggestions')
            );
    }

    public function test_user_can_create_draft_practice_session(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->post(route('practice-sessions.store'), [
            'title' => 'Product demo practice',
            'topic' => 'Launch narrative for the AI coach',
            'session_type' => 'presentation',
            'target_duration_seconds' => 300,
            'objective' => 'Sound clear, confident, and concise.',
        ]);

        $session = PracticeSession::query()->firstOrFail();

        $response->assertRedirect(route('practice-sessions.show', $session));

        $this->assertSame($user->id, $session->user_id);
        $this->assertSame('draft', $session->status);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $session->id,
        );
        $this->assertDatabaseHas('practice_sessions', [
            'id' => $session->id,
            'title' => 'Product demo practice',
            'topic' => 'Launch narrative for the AI coach',
            'session_type' => 'presentation',
            'target_duration_seconds' => 300,
            'objective' => 'Sound clear, confident, and concise.',
            'status' => 'draft',
        ]);
    }

    public function test_practice_session_creation_validates_fields(): void
    {
        $user = $this->completedUser();

        $response = $this->actingAs($user)->post(route('practice-sessions.store'), [
            'title' => '',
            'topic' => '',
            'session_type' => 'standup_comedy',
            'target_duration_seconds' => 30,
            'objective' => '',
        ]);

        $response->assertSessionHasErrors([
            'title',
            'topic',
            'session_type',
            'target_duration_seconds',
            'objective',
        ]);
    }

    public function test_user_can_view_their_own_practice_session(): void
    {
        $user = $this->completedUser();
        $session = PracticeSession::factory()
            ->for($user)
            ->create([
                'title' => 'Interview opener',
            ]);

        $response = $this->actingAs($user)->get(route('practice-sessions.show', $session));

        $response
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('PracticeSessions/Show')
                ->where('session.id', $session->id)
                ->where('session.title', 'Interview opener')
            );
    }

    public function test_user_cannot_view_another_users_practice_session(): void
    {
        $user = $this->completedUser();
        $otherUser = $this->completedUser();
        $session = PracticeSession::factory()->for($otherUser)->create();

        $response = $this->actingAs($user)->get(route('practice-sessions.show', $session));

        $response->assertNotFound();
    }

    private function completedUser(): User
    {
        return User::factory()
            ->has(UserProfile::factory(), 'profile')
            ->create();
    }
}
