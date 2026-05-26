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
            && $this->user()->can('record', $practiceSession);
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
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'audio.required' => __('Please choose a recorded audio file before uploading.'),
            'audio.file' => __('The recording must be uploaded as an audio file.'),
            'audio.mimetypes' => __('The recording must be a WebM, MP3, WAV, MPEG, or OGG audio file.'),
            'audio.max' => __('The recording is too large. Please record a shorter take or reduce the file size.'),
            'duration_seconds.integer' => __('The recording duration must be a whole number of seconds.'),
            'duration_seconds.max' => __('Recordings can be no longer than two hours.'),
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
