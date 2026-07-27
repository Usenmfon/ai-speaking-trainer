<?php

namespace App\Http\Requests\PracticeSession;

use App\Models\PracticeSession;
use App\Support\PublicSpeakingTemplates;
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
            'interview_role_title' => ['nullable', 'required_if:session_type,interview', 'string', 'max:160'],
            'interview_company' => ['nullable', 'string', 'max:160'],
            'interview_stage' => ['nullable', 'string', 'max:160'],
            'interview_question_type' => ['nullable', 'required_if:session_type,interview', 'string', Rule::in(PracticeSession::InterviewQuestionTypes)],
            'interview_job_description' => ['nullable', 'string', 'max:5000'],
            'public_speaking_template_key' => ['nullable', 'required_if:session_type,public_speaking', 'string', Rule::in(PublicSpeakingTemplates::keys())],
            'public_speaking_template_title' => ['nullable', 'required_if:session_type,public_speaking', 'string', 'max:160'],
            'public_speaking_script' => ['nullable', 'required_if:session_type,public_speaking', 'string', 'max:6000'],
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
            'interview_role_title.required_if' => __('Add the role you want to interview for.'),
            'interview_role_title.max' => __('Keep the interview role under 160 characters.'),
            'interview_company.max' => __('Keep the company name under 160 characters.'),
            'interview_stage.max' => __('Keep the interview stage under 160 characters.'),
            'interview_question_type.required_if' => __('Choose the kind of interview question you want to practice.'),
            'interview_question_type.in' => __('Choose a valid interview question type.'),
            'interview_job_description.max' => __('Keep the job description under 5,000 characters.'),
            'public_speaking_template_key.required_if' => __('Choose a public speaking template.'),
            'public_speaking_template_key.in' => __('Choose a valid public speaking template.'),
            'public_speaking_template_title.required_if' => __('Choose a public speaking template.'),
            'public_speaking_template_title.max' => __('Keep the template title under 160 characters.'),
            'public_speaking_script.required_if' => __('Add the script you want to practice from.'),
            'public_speaking_script.max' => __('Keep the public speaking script under 6,000 characters.'),
        ];
    }
}
