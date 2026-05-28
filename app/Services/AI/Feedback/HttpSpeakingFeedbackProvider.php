<?php

namespace App\Services\AI\Feedback;

use App\Contracts\AI\SpeakingFeedbackProvider;
use App\Models\PracticeSessionTranscript;
use Illuminate\Support\Facades\Http;
use JsonException;
use RuntimeException;

class HttpSpeakingFeedbackProvider implements SpeakingFeedbackProvider
{
    public function analyze(PracticeSessionTranscript $transcript, string $prompt): string
    {
        $endpoint = config('speaking_feedback.endpoint');

        if (! is_string($endpoint) || $endpoint === '') {
            throw new RuntimeException('SPEAKING_FEEDBACK_ENDPOINT is required when AI_FEEDBACK_PROVIDER=http.');
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
            'transcript_id' => $transcript->id,
            'practice_session_id' => $transcript->practice_session_id,
        ])->throw();

        $json = $response->json('feedback')
            ?? $response->json('content')
            ?? $response->body();

        if (is_array($json)) {
            try {
                return json_encode($json, JSON_THROW_ON_ERROR);
            } catch (JsonException $exception) {
                throw new RuntimeException('HTTP feedback response could not be encoded as JSON: '.$exception->getMessage());
            }
        }

        return (string) $json;
    }
}
