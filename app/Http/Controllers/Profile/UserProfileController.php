<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UserProfileRequest;
use App\Models\UserProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    /**
     * Show the profile completion page.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->profile?->onboarding_completed) {
            return to_route('dashboard');
        }

        return Inertia::render('profile/complete', [
            'profile' => $request->user()->profile,
            ...$this->formOptions(),
        ]);
    }

    /**
     * Store the user's completed speaking profile.
     */
    public function store(UserProfileRequest $request): RedirectResponse
    {
        $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                ...$request->validated(),
                'onboarding_completed' => true,
            ],
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile completed. You are ready to practice.')]);

        return to_route('dashboard');
    }

    /**
     * Show the speaking profile edit page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('profile/edit', [
            'profile' => $request->user()->profile,
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the user's speaking profile.
     */
    public function update(UserProfileRequest $request): RedirectResponse
    {
        $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                ...$request->validated(),
                'onboarding_completed' => true,
            ],
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Speaking profile updated.')]);

        return to_route('user-profile.edit');
    }

    /**
     * Get select options for the profile form.
     *
     * @return array{speakingLevels: array<int, string>, mainGoals: array<int, string>}
     */
    private function formOptions(): array
    {
        return [
            'speakingLevels' => UserProfile::SpeakingLevels,
            'mainGoals' => UserProfile::MainGoals,
        ];
    }
}
