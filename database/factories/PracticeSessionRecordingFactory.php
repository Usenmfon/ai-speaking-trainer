<?php

namespace Database\Factories;

use App\Models\PracticeSession;
use App\Models\PracticeSessionRecording;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PracticeSessionRecording>
 */
class PracticeSessionRecordingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'practice_session_id' => PracticeSession::factory(),
            'user_id' => User::factory(),
            'audio_path' => 'practice-session-recordings/'.fake()->uuid().'.webm',
            'original_filename' => 'practice-session.webm',
            'mime_type' => 'audio/webm',
            'size' => fake()->numberBetween(1024, 1024 * 1024),
            'duration_seconds' => fake()->numberBetween(30, 600),
            'uploaded_at' => now(),
        ];
    }
}
