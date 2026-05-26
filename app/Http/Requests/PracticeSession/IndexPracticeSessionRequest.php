<?php

namespace App\Http\Requests\PracticeSession;

use App\Models\PracticeSession;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexPracticeSessionRequest extends FormRequest
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
            'search' => ['nullable', 'string', 'max:120'],
            'session_type' => ['nullable', 'string', Rule::in(PracticeSession::SessionTypes)],
            'status' => ['nullable', 'string', Rule::in(PracticeSession::Statuses)],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'sort' => ['nullable', 'string', Rule::in(['newest', 'oldest', 'highest_score', 'lowest_score'])],
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
            'search.max' => __('Search terms must be 120 characters or fewer.'),
            'session_type.in' => __('Choose a valid practice mode filter.'),
            'status.in' => __('Choose a valid session status filter.'),
            'date_from.date' => __('Choose a valid start date.'),
            'date_to.date' => __('Choose a valid end date.'),
            'date_to.after_or_equal' => __('The end date must be the same as or after the start date.'),
            'sort.in' => __('Choose a valid sorting option.'),
        ];
    }
}
