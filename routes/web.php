<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AiCoachController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PracticeSessionController;
use App\Http\Controllers\PracticeSessionRecordingController;
use App\Http\Controllers\PracticeSessionRetryController;
use App\Http\Controllers\Profile\UserProfileController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\SpeakingFeedbackReportController;
use App\Http\Middleware\EnsureUserProfileIsComplete;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('profile/complete', [UserProfileController::class, 'create'])->name('user-profile.complete');
    Route::post('profile/complete', [UserProfileController::class, 'store'])->name('user-profile.store');
    Route::get('profile', [UserProfileController::class, 'edit'])->name('user-profile.edit');
    Route::patch('profile', [UserProfileController::class, 'update'])->name('user-profile.update');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])
        ->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])
        ->name('notifications.read-all');
});

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('users', [AdminDashboardController::class, 'users'])->name('users.index');
        Route::get('sessions', [AdminDashboardController::class, 'sessions'])->name('sessions.index');
        Route::get('content', [AdminDashboardController::class, 'content'])->name('content.index');
        Route::get('processing', [AdminDashboardController::class, 'processing'])->name('processing.index');
        Route::get('notifications', [AdminDashboardController::class, 'notifications'])->name('notifications.index');
        Route::get('settings', [AdminDashboardController::class, 'settings'])->name('settings.index');
        Route::get('audit-logs', [AdminDashboardController::class, 'auditLogs'])->name('audit-logs.index');
    });

Route::middleware(['auth', 'verified', EnsureUserProfileIsComplete::class])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('ai-coach', AiCoachController::class)->name('ai-coach');
    Route::get('progress', ProgressController::class)->name('progress');
    Route::get('community', CommunityController::class)->name('community');
    Route::inertia('practice', 'practice')->name('practice');
    Route::resource('practice-sessions', PracticeSessionController::class)
        ->only(['index', 'create', 'store', 'show']);
    Route::resource('feedback-reports', SpeakingFeedbackReportController::class)
        ->only(['index', 'show']);
    Route::post('practice-sessions/{practiceSession}/recording', [PracticeSessionRecordingController::class, 'store'])
        ->name('practice-sessions.recording.store');
    Route::get('practice-sessions/{practiceSession}/recording/playback', [PracticeSessionRecordingController::class, 'playback'])
        ->name('practice-sessions.recording.playback');
    Route::post('practice-sessions/{practiceSession}/retry-transcription', [PracticeSessionRetryController::class, 'transcription'])
        ->name('practice-sessions.retry-transcription');
    Route::post('practice-sessions/{practiceSession}/retry-analysis', [PracticeSessionRetryController::class, 'analysis'])
        ->name('practice-sessions.retry-analysis');
    Route::get('practice-sessions/{practiceSession}/feedback-report', [SpeakingFeedbackReportController::class, 'session'])
        ->name('practice-sessions.feedback-report.show');
});

require __DIR__.'/settings.php';
