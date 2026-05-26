<?php

namespace App\Http\Requests\PracticeSession;

use App\Models\PracticeSession;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePracticeSessionRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:160'],
            'topic' => ['required', 'string', 'max:255'],
            'session_type' => ['required', 'string', Rule::in(PracticeSession::SessionTypes)],
            'target_duration_seconds' => ['required', 'integer', 'min:60', 'max:7200'],
            'objective' => ['required', 'string', 'max:2000'],
        ];
    }
}
