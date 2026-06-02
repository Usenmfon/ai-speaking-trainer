<?php

namespace Tests\Feature;

use App\Services\AI\Transcription\GeminiTranscriptionProvider;
use App\Services\AI\Transcription\GroqTranscriptionProvider;
use App\Services\AI\Transcription\OpenAiTranscriptionProvider;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NativeTranscriptionProviderTest extends TestCase
{
    public function test_openai_provider_transcribes_audio_with_laravel_http_client(): void
    {
        config()->set('ai.transcription.openai.api_key', 'test-openai-key');

        Http::fake([
            'api.openai.com/*' => Http::response([
                'text' => 'Hello from OpenAI.',
                'language' => 'en',
                'duration' => 2.5,
                'segments' => [
                    ['id' => 0, 'start' => 0, 'end' => 2.5, 'text' => 'Hello from OpenAI.'],
                ],
            ]),
        ]);

        $transcription = app(OpenAiTranscriptionProvider::class)->transcribeRecording(
            audioPath: $this->audioFixturePath('openai.webm'),
            sessionId: 'session-1',
            recordingId: 'recording-1',
        );

        $this->assertSame('Hello from OpenAI.', $transcription['transcript']);
        $this->assertSame('openai', $transcription['provider']);
        $this->assertSame('whisper-1', $transcription['model']);
        $this->assertCount(1, $transcription['segments']);
    }

    public function test_groq_provider_transcribes_audio_with_laravel_http_client(): void
    {
        config()->set('ai.transcription.groq.api_key', 'test-groq-key');

        Http::fake([
            'api.groq.com/*' => Http::response([
                'text' => 'Hello from Groq.',
                'language' => 'en',
                'duration' => 2.5,
                'segments' => [],
            ]),
        ]);

        $transcription = app(GroqTranscriptionProvider::class)->transcribeRecording(
            audioPath: $this->audioFixturePath('groq.webm'),
            sessionId: 'session-1',
            recordingId: 'recording-1',
        );

        $this->assertSame('Hello from Groq.', $transcription['transcript']);
        $this->assertSame('groq', $transcription['provider']);
        $this->assertSame('whisper-large-v3-turbo', $transcription['model']);
    }

    public function test_gemini_provider_transcribes_audio_with_laravel_http_client(): void
    {
        config()->set('ai.transcription.gemini.api_key', 'test-gemini-key');

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Hello from Gemini.'],
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        $transcription = app(GeminiTranscriptionProvider::class)->transcribeRecording(
            audioPath: $this->audioFixturePath('gemini.webm'),
            sessionId: 'session-1',
            recordingId: 'recording-1',
        );

        $this->assertSame('Hello from Gemini.', $transcription['transcript']);
        $this->assertSame('gemini', $transcription['provider']);
        $this->assertSame('gemini-2.5-flash', $transcription['model']);
    }

    private function audioFixturePath(string $filename): string
    {
        $path = storage_path("framework/testing/{$filename}");

        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }

        file_put_contents($path, 'audio');

        return $path;
    }
}
