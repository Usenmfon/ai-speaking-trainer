<?php

namespace App\Services\AI\Feedback;

use App\Contracts\AI\SpeakingFeedbackProvider;
use App\Models\PracticeSessionTranscript;

class LocalSpeakingFeedbackProvider implements SpeakingFeedbackProvider
{
    public function analyze(PracticeSessionTranscript $transcript, string $prompt): string
    {
        $words = str_word_count(mb_strtolower($transcript->text), 1);
        $wordCount = count($words);
        $fillerWords = collect(['um', 'uh', 'like', 'actually', 'basically'])
            ->map(fn (string $word): array => [
                'word' => $word,
                'count' => count(array_filter($words, fn (string $item): bool => $item === $word)),
            ])
            ->filter(fn (array $item): bool => $item['count'] > 0)
            ->values()
            ->all();

        $fillerCount = array_sum(array_column($fillerWords, 'count'));
        $clarityScore = $wordCount > 40 ? 82 : 68;
        $fillerScore = max(45, 95 - ($fillerCount * 8));

        return json_encode([
            'overall_score' => (int) round(($clarityScore + $fillerScore + 78 + 76 + 80) / 5),
            'clarity_score' => $clarityScore,
            'structure_score' => 78,
            'confidence_score' => 76,
            'pace_score' => 80,
            'filler_word_score' => $fillerScore,
            'summary_feedback' => 'Your message is understandable and has a workable foundation. Improve by making the opening more direct, grouping ideas into clearer sections, and using intentional pauses instead of filler words.',
            'strengths' => [
                'The main topic is easy to identify.',
                'The delivery has enough substance for targeted coaching.',
            ],
            'weaknesses' => [
                'The structure can be sharper.',
                'Some phrases could be more concise.',
            ],
            'recommendations' => [
                'Open with the key outcome in one sentence.',
                'Use three clear points: problem, insight, next step.',
                'Pause for one beat when you feel a filler word coming.',
            ],
            'filler_words' => $fillerWords,
            'improved_version' => 'Here is a clearer version: Start with the main point, support it with one specific example, and close with the action you want the audience to take.',
        ], JSON_THROW_ON_ERROR);
    }
}
