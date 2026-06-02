<?php

namespace Database\Factories;

use App\Models\PracticeSessionTranscript;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PracticeSessionTranscript>
 */
class PracticeSessionTranscriptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'practice_session_id' => PracticeSessionFactory::new(),
            'user_id' => User::factory(),
            'practice_session_recording_id' => PracticeSessionRecordingFactory::new(),
            'text' => fake()->paragraphs(3, true),
            'segments' => [
                [
                    'start' => 0,
                    'end' => 12,
                    'text' => fake()->sentence(),
                ],
            ],
            'provider' => 'mock',
            'completed_at' => now(),
        ];
    }
}
