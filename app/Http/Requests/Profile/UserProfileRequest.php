<?php

namespace App\Http\Requests\Profile;

use App\Models\UserProfile;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'speaking_level' => ['required', 'string', Rule::in(UserProfile::SpeakingLevels)],
            'main_goal' => ['required', 'string', Rule::in(UserProfile::MainGoals)],
            'preferred_language' => ['required', 'string', 'max:80'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
