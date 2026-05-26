<?php

namespace App\Http\Requests\PracticeSession;

use App\Models\PracticeSession;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePracticeSessionRecordingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $practiceSession = $this->route('practiceSession');

        return $practiceSession instanceof PracticeSession
            && $this->user() !== null
            && $practiceSession->user_id === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'audio' => [
                'required',
                'file',
                'mimetypes:audio/webm,audio/mp3,audio/wav,audio/mpeg,audio/ogg',
                'max:'.config('practice.recordings.max_audio_kb'),
            ],
            'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:7200'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $practiceSession = $this->route('practiceSession');

                if (
                    $practiceSession instanceof PracticeSession
                    && $practiceSession->status === 'analyzed'
                ) {
                    $validator->errors()->add(
                        'audio',
                        __('This practice session has already been analyzed.'),
                    );
                }
            },
        ];
    }
}
