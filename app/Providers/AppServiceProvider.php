<?php

namespace App\Providers;

use App\Contracts\AI\SpeakingFeedbackProvider;
use App\Contracts\AI\TranscriptionProvider;
use App\Models\PracticeSession;
use App\Models\SpeakingFeedbackReport;
use App\Observers\PracticeSessionObserver;
use App\Policies\FeedbackReportPolicy;
use App\Policies\PracticeSessionPolicy;
use App\Services\AI\Feedback\GeminiSpeakingFeedbackProvider;
use App\Services\AI\Feedback\GrokSpeakingFeedbackProvider;
use App\Services\AI\Feedback\GroqSpeakingFeedbackProvider;
use App\Services\AI\Feedback\HttpSpeakingFeedbackProvider;
use App\Services\AI\Feedback\LocalSpeakingFeedbackProvider;
use App\Services\AI\Feedback\OpenAiSpeakingFeedbackProvider;
use App\Services\AI\Transcription\GeminiTranscriptionProvider;
use App\Services\AI\Transcription\GrokTranscriptionProvider;
use App\Services\AI\Transcription\GroqTranscriptionProvider;
use App\Services\AI\Transcription\LocalTranscriptionProvider;
use App\Services\AI\Transcription\OpenAiTranscriptionProvider;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use InvalidArgumentException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(TranscriptionProvider::class, function () {
            $provider = config('ai.transcription.provider', 'openai');

            return match ($provider) {
                'openai', 'python_worker' => app(OpenAiTranscriptionProvider::class),
                'gemini' => app(GeminiTranscriptionProvider::class),
                'grok' => app(GrokTranscriptionProvider::class),
                'groq' => app(GroqTranscriptionProvider::class),
                'local' => app(LocalTranscriptionProvider::class),
                default => throw new InvalidArgumentException("Unsupported transcription provider [{$provider}]."),
            };
        });

        $this->app->bind(SpeakingFeedbackProvider::class, function () {
            $provider = config('speaking_feedback.provider', 'local');

            return match ($provider) {
                'local' => app(LocalSpeakingFeedbackProvider::class),
                'http' => app(HttpSpeakingFeedbackProvider::class),
                'openai' => app(OpenAiSpeakingFeedbackProvider::class),
                'gemini' => app(GeminiSpeakingFeedbackProvider::class),
                'grok' => app(GrokSpeakingFeedbackProvider::class),
                'groq' => app(GroqSpeakingFeedbackProvider::class),
                default => throw new InvalidArgumentException("Unsupported speaking feedback provider [{$provider}]."),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        PracticeSession::observe(PracticeSessionObserver::class);

        Gate::policy(PracticeSession::class, PracticeSessionPolicy::class);
        Gate::policy(SpeakingFeedbackReport::class, FeedbackReportPolicy::class);

        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
