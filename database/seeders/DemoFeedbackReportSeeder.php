<?php

namespace Database\Seeders;

use App\Models\PracticeSession;
use App\Models\PracticeSessionTranscript;
use App\Models\SpeakingFeedbackReport;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoFeedbackReportSeeder extends Seeder
{
    /**
     * Seed transcripts and reports for analyzed demo sessions.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->firstOrFail();

        $this->createReport(
            user: $user,
            sessionTitle: 'Investor pitch rehearsal',
            transcriptText: 'Today I want to show why AI speaking practice helps professionals prepare for high stakes moments. The product gives immediate feedback on clarity, pacing, filler words, and confidence so each rehearsal becomes specific and measurable.',
            scores: [
                'overall_score' => 86,
                'clarity_score' => 88,
                'structure_score' => 84,
                'confidence_score' => 82,
                'pace_score' => 90,
                'filler_word_score' => 78,
            ],
        );

        $this->createReport(
            user: $user,
            sessionTitle: 'Behavioral interview answer',
            transcriptText: 'In my last role, two teams disagreed about launch scope. I created a shared decision document, clarified the customer impact, and helped the group choose a smaller release that still solved the urgent problem.',
            scores: [
                'overall_score' => 74,
                'clarity_score' => 76,
                'structure_score' => 80,
                'confidence_score' => 70,
                'pace_score' => 72,
                'filler_word_score' => 68,
            ],
        );
    }

    /**
     * @param  array<string, int>  $scores
     */
    private function createReport(User $user, string $sessionTitle, string $transcriptText, array $scores): void
    {
        $session = PracticeSession::query()
            ->whereBelongsTo($user)
            ->where('title', $sessionTitle)
            ->firstOrFail();

        $recording = $session->recording()->first();

        /** @var PracticeSessionTranscript $transcript */
        $transcript = PracticeSessionTranscript::query()->updateOrCreate(
            ['practice_session_id' => $session->id],
            [
                'user_id' => $user->id,
                'practice_session_recording_id' => $recording?->id,
                'text' => $transcriptText,
                'segments' => [
                    [
                        'start' => 0,
                        'end' => 18,
                        'text' => $transcriptText,
                    ],
                ],
                'provider' => 'seeded',
                'completed_at' => $session->completed_at ?? now(),
            ],
        );

        SpeakingFeedbackReport::query()->updateOrCreate(
            ['practice_session_id' => $session->id],
            [
                'user_id' => $user->id,
                'transcript_id' => $transcript->id,
                ...$scores,
                'summary_feedback' => 'Strong practice take with clear intent. Focus next on sharper openings, intentional pauses, and more specific transitions between ideas.',
                'strengths' => ['Clear message', 'Good audience awareness', 'Confident close'],
                'weaknesses' => ['Opening can be tighter', 'A few filler words', 'Transitions need more signposting'],
                'recommendations' => ['Start with the outcome first', 'Pause for one beat between major points', 'Use numbered transitions'],
                'filler_words' => [
                    ['word' => 'um', 'count' => 2],
                    ['word' => 'like', 'count' => 1],
                ],
                'improved_version' => 'Here is a tighter version: I want to show how AI speaking practice turns every rehearsal into measurable progress by giving fast feedback on clarity, pace, confidence, and filler words.',
                'status' => 'completed',
                'error_message' => null,
                'processed_at' => $session->completed_at ?? now(),
            ],
        );
    }
}
