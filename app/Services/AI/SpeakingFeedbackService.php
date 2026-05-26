<?php

namespace App\Services\AI;

use App\Models\PracticeSession;
use App\Models\PracticeSessionTranscript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use JsonException;
use RuntimeException;

class SpeakingFeedbackService
{
    /**
     * Analyze a completed transcript and return normalized feedback data.
     *
     * @return array{
     *     overall_score: int|null,
     *     clarity_score: int|null,
     *     structure_score: int|null,
     *     confidence_score: int|null,
     *     pace_score: int|null,
     *     filler_word_score: int|null,
     *     summary_feedback: string,
     *     strengths: array<int, string>,
     *     weaknesses: array<int, string>,
     *     recommendations: array<int, string>,
     *     filler_words: array<int, array{word: string, count: int}>,
     *     improved_version: string|null
     * }
     */
    public function analyze(PracticeSessionTranscript $transcript): array
    {
        $practiceSession = $transcript->practiceSession;
        $prompt = $this->buildPrompt($transcript, $practiceSession);
        $provider = config('speaking_feedback.provider', 'local');

        if ($provider === 'http') {
            return $this->parseAndValidate($this->requestExternalAnalysis($prompt));
        }

        return $this->parseAndValidate($this->localAnalysis($transcript->text));
    }

    /**
     * Build the AI prompt used for speaking feedback analysis.
     */
    public function buildPrompt(PracticeSessionTranscript $transcript, PracticeSession $practiceSession): string
    {
        return <<<PROMPT
You are an expert AI speaking coach. Analyze the transcript for:
- clarity
- confidence
- structure
- filler words
- grammar
- delivery
- persuasiveness
- improvement tips

Return only valid JSON. Do not wrap it in markdown.

The JSON must match this schema:
{
  "overall_score": 0-100 integer or null,
  "clarity_score": 0-100 integer or null,
  "structure_score": 0-100 integer or null,
  "confidence_score": 0-100 integer or null,
  "pace_score": 0-100 integer or null,
  "filler_word_score": 0-100 integer or null,
  "summary_feedback": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "filler_words": [{"word": "string", "count": 1}],
  "improved_version": "string or null"
}

Practice session:
Title: {$practiceSession->title}
Topic: {$practiceSession->topic}
Objective: {$practiceSession->objective}
Session type: {$practiceSession->session_type}

Transcript:
{$transcript->text}
PROMPT;
    }

    /**
     * Request analysis from a configured HTTP AI endpoint.
     */
    private function requestExternalAnalysis(string $prompt): string
    {
        $endpoint = config('speaking_feedback.endpoint');

        if (! is_string($endpoint) || $endpoint === '') {
            throw new RuntimeException('SPEAKING_FEEDBACK_ENDPOINT is required when SPEAKING_FEEDBACK_PROVIDER=http.');
        }

        $request = Http::acceptJson()
            ->timeout(config('speaking_feedback.timeout'))
            ->retry(2, 500);

        $apiKey = config('speaking_feedback.api_key');

        if (is_string($apiKey) && $apiKey !== '') {
            $request = $request->withToken($apiKey);
        }

        $response = $request->post($endpoint, [
            'prompt' => $prompt,
            'response_format' => ['type' => 'json_object'],
        ])->throw();

        $json = $response->json('feedback')
            ?? $response->json('content')
            ?? $response->body();

        if (is_array($json)) {
            return json_encode($json, JSON_THROW_ON_ERROR);
        }

        return (string) $json;
    }

    /**
     * Generate local deterministic feedback for development and tests.
     */
    private function localAnalysis(string $transcript): string
    {
        $words = str_word_count(mb_strtolower($transcript), 1);
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

    /**
     * Safely parse and validate the AI JSON response.
     *
     * @return array{
     *     overall_score: int|null,
     *     clarity_score: int|null,
     *     structure_score: int|null,
     *     confidence_score: int|null,
     *     pace_score: int|null,
     *     filler_word_score: int|null,
     *     summary_feedback: string,
     *     strengths: array<int, string>,
     *     weaknesses: array<int, string>,
     *     recommendations: array<int, string>,
     *     filler_words: array<int, array{word: string, count: int}>,
     *     improved_version: string|null
     * }
     */
    private function parseAndValidate(string $json): array
    {
        try {
            $decoded = json_decode($this->extractJson($json), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException('AI feedback response was not valid JSON: '.$exception->getMessage());
        }

        if (! is_array($decoded)) {
            throw new RuntimeException('AI feedback response must be a JSON object.');
        }

        $validator = Validator::make($decoded, [
            'overall_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'clarity_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'structure_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'confidence_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'pace_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'filler_word_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'summary_feedback' => ['required', 'string'],
            'strengths' => ['nullable', 'array'],
            'strengths.*' => ['string'],
            'weaknesses' => ['nullable', 'array'],
            'weaknesses.*' => ['string'],
            'recommendations' => ['nullable', 'array'],
            'recommendations.*' => ['string'],
            'filler_words' => ['nullable', 'array'],
            'filler_words.*.word' => ['required_with:filler_words', 'string'],
            'filler_words.*.count' => ['required_with:filler_words', 'integer', 'min:0'],
            'improved_version' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            throw new RuntimeException(
                'AI feedback response failed validation: '.
                $validator->errors()->toJson(),
            );
        }

        /** @var array<string, mixed> $validated */
        $validated = $validator->validated();

        return [
            'overall_score' => $validated['overall_score'] ?? null,
            'clarity_score' => $validated['clarity_score'] ?? null,
            'structure_score' => $validated['structure_score'] ?? null,
            'confidence_score' => $validated['confidence_score'] ?? null,
            'pace_score' => $validated['pace_score'] ?? null,
            'filler_word_score' => $validated['filler_word_score'] ?? null,
            'summary_feedback' => $validated['summary_feedback'],
            'strengths' => $validated['strengths'] ?? [],
            'weaknesses' => $validated['weaknesses'] ?? [],
            'recommendations' => $validated['recommendations'] ?? [],
            'filler_words' => $validated['filler_words'] ?? [],
            'improved_version' => $validated['improved_version'] ?? null,
        ];
    }

    /**
     * Extract a JSON object if a provider wraps it in extra text.
     */
    private function extractJson(string $response): string
    {
        $trimmed = trim($response);

        if (str_starts_with($trimmed, '{') && str_ends_with($trimmed, '}')) {
            return $trimmed;
        }

        $start = mb_strpos($trimmed, '{');
        $end = mb_strrpos($trimmed, '}');

        if ($start === false || $end === false || $end <= $start) {
            return $trimmed;
        }

        return mb_substr($trimmed, $start, $end - $start + 1);
    }
}
