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
        $extensions = implode(',', config('practice.recordings.allowed_extensions', []));
        $mimeTypes = implode(',', config('practice.recordings.allowed_mime_types', []));

        return [
            'audio' => [
                'required',
                'file',
                'extensions:'.$extensions,
                'mimetypes:'.$mimeTypes,
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
            'audio.extensions' => __('The recording filename must use a supported audio extension.'),
            'audio.mimetypes' => __('The recording must be a supported audio file such as WebM, MP3, WAV, OGG, M4A, MP4, or FLAC.'),
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
                    && in_array($practiceSession->status, [
                        'transcribing',
                        'transcribed',
                        'analyzing',
                        'analyzed',
                    ], true)
                ) {
                    $validator->errors()->add(
                        'audio',
                        __('This practice session is already being processed or has been analyzed.'),
                    );
                }
            },
        ];
    }
}
