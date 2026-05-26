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

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => __('Give this practice session a short title.'),
            'title.max' => __('Keep the title under 160 characters.'),
            'topic.required' => __('Add the topic you want to practice.'),
            'topic.max' => __('Keep the topic under 255 characters.'),
            'session_type.required' => __('Choose a practice mode.'),
            'session_type.in' => __('Choose one of the available practice modes.'),
            'target_duration_seconds.required' => __('Choose a target duration.'),
            'target_duration_seconds.integer' => __('The target duration must be a whole number of seconds.'),
            'target_duration_seconds.min' => __('Choose a duration of at least one minute.'),
            'target_duration_seconds.max' => __('Choose a duration of two hours or less.'),
            'objective.required' => __('Describe what you want to improve in this session.'),
            'objective.max' => __('Keep the objective under 2,000 characters.'),
        ];
    }
}
