<?php

namespace Database\Seeders;

use App\Models\PracticeSession;
use App\Models\PracticeSessionRecording;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoPracticeSessionSeeder extends Seeder
{
    /**
     * Seed demo practice sessions for local UI testing.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->firstOrFail();

        $this->createSession($user, [
            'title' => 'Investor pitch rehearsal',
            'topic' => 'Explain why the AI Speaking Coach improves interview confidence',
            'session_type' => 'presentation',
            'target_duration_seconds' => 300,
            'objective' => 'Open with a clear value proposition and reduce filler words.',
            'status' => 'analyzed',
            'started_at' => now()->subDays(7)->subMinutes(8),
            'completed_at' => now()->subDays(7),
        ]);

        $this->createSession($user, [
            'title' => 'Behavioral interview answer',
            'topic' => 'Tell me about a time you resolved a conflict on a team',
            'session_type' => 'interview',
            'target_duration_seconds' => 180,
            'objective' => 'Use a clear situation, action, and result structure.',
            'status' => 'analyzed',
            'started_at' => now()->subDays(3)->subMinutes(5),
            'completed_at' => now()->subDays(3),
        ]);

        $this->createSession($user, [
            'title' => 'Product update practice',
            'topic' => 'Summarize weekly product progress for leadership',
            'session_type' => 'impromptu',
            'target_duration_seconds' => 120,
            'objective' => 'Stay concise and sound confident under time pressure.',
            'status' => 'failed',
            'started_at' => now()->subDay()->subMinutes(4),
            'completed_at' => now()->subDay(),
        ]);

        $this->createSession($user, [
            'title' => 'Conference intro draft',
            'topic' => 'Introduce a talk about communication habits for remote teams',
            'session_type' => 'storytelling',
            'target_duration_seconds' => 600,
            'objective' => 'Create a memorable opening story.',
            'status' => 'draft',
            'started_at' => null,
            'completed_at' => null,
        ], withRecording: false);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createSession(User $user, array $attributes, bool $withRecording = true): PracticeSession
    {
        /** @var PracticeSession $session */
        $session = PracticeSession::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'title' => $attributes['title'],
            ],
            [
                ...$attributes,
                'user_id' => $user->id,
            ],
        );

        if ($withRecording) {
            PracticeSessionRecording::query()->updateOrCreate(
                ['practice_session_id' => $session->id],
                [
                    'user_id' => $user->id,
                    'audio_path' => 'practice-session-recordings/demo/'.$session->id.'.webm',
                    'original_filename' => str($session->title)->slug().'.webm',
                    'mime_type' => 'audio/webm',
                    'size' => 512000,
                    'duration_seconds' => min((int) $session->target_duration_seconds, 300),
                    'uploaded_at' => $session->completed_at ?? now(),
                ],
            );
        }

        return $session;
    }
}
