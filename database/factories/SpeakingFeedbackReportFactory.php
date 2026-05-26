<?php

namespace Database\Factories;

use App\Models\PracticeSession;
use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SpeakingFeedbackReport>
 */
class SpeakingFeedbackReportFactory extends Factory
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
            'transcript_id' => PracticeSessionTranscript::factory(),
            'overall_score' => 78,
            'clarity_score' => 80,
            'structure_score' => 74,
            'confidence_score' => 76,
            'pace_score' => 82,
            'filler_word_score' => 70,
            'summary_feedback' => 'You communicated the core idea clearly and can improve by tightening the opening.',
            'strengths' => ['Clear topic', 'Confident closing'],
            'weaknesses' => ['Opening could be tighter', 'Some filler words'],
            'recommendations' => ['Lead with the outcome', 'Pause instead of using filler words'],
            'filler_words' => [
                ['word' => 'um', 'count' => 2],
            ],
            'improved_version' => 'Here is a clearer version of the message.',
            'status' => 'completed',
            'error_message' => null,
            'processed_at' => now(),
        ];
    }

    /**
     * Indicate that the report is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'overall_score' => null,
            'summary_feedback' => '',
            'status' => 'pending',
            'processed_at' => null,
        ]);
    }
}
