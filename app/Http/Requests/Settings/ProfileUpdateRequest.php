<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use App\Models\UserProfile;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->profileRules($this->user()->id),
            'speaking_level' => ['required', 'string', Rule::in(UserProfile::SpeakingLevels)],
            'main_goal' => ['required', 'string', Rule::in(UserProfile::MainGoals)],
            'preferred_language' => ['required', 'string', 'max:80'],
        ];
    }
}
