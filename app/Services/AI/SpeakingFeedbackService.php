<?php

namespace App\Services\AI;

use App\Contracts\AI\SpeakingFeedbackProvider;
use App\Models\PracticeSession;
use App\Models\PracticeSessionTranscript;
use Illuminate\Support\Facades\Validator;
use JsonException;
use RuntimeException;

class SpeakingFeedbackService
{
    public function __construct(private ?SpeakingFeedbackProvider $provider = null) {}

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
        $provider = $this->provider ?? app(SpeakingFeedbackProvider::class);

        return $this->parseAndValidate($provider->analyze($transcript, $prompt));
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
