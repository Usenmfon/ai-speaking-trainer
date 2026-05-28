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
use App\Services\AI\Feedback\HttpSpeakingFeedbackProvider;
use App\Services\AI\Feedback\LocalSpeakingFeedbackProvider;
use App\Services\AI\Feedback\OpenAiSpeakingFeedbackProvider;
use App\Services\AI\Transcription\PythonWorkerTranscriptionProvider;
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
            $provider = config('ai.transcription.provider', 'python_worker');

            return match ($provider) {
                // "openai" is accepted as an alias because the Python worker
                // currently performs OpenAI audio transcription for the MVP.
                'python_worker', 'openai' => app(PythonWorkerTranscriptionProvider::class),
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
