<?php

use App\Http\Controllers\PracticeSessionController;
use App\Http\Controllers\Profile\UserProfileController;
use App\Http\Middleware\EnsureUserProfileIsComplete;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('profile/complete', [UserProfileController::class, 'create'])->name('user-profile.complete');
    Route::post('profile/complete', [UserProfileController::class, 'store'])->name('user-profile.store');
    Route::get('profile', [UserProfileController::class, 'edit'])->name('user-profile.edit');
    Route::patch('profile', [UserProfileController::class, 'update'])->name('user-profile.update');
});

Route::middleware(['auth', 'verified', EnsureUserProfileIsComplete::class])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('practice', 'practice')->name('practice');
    Route::resource('practice-sessions', PracticeSessionController::class)
        ->only(['index', 'create', 'store', 'show']);
});

require __DIR__.'/settings.php';
