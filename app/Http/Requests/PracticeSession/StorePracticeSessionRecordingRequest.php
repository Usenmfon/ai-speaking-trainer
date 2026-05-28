<?php

namespace App\Http\Requests\PracticeSession;

use App\Models\PracticeSession;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Validator as ValidationValidator;
use Throwable;

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
            'audio.uploaded' => __('The recording could not be uploaded. Check that the browser sent a valid audio file and that PHP can write upload temp files.'),
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
     * @return array<int, callable(ValidationValidator): void>
     */
    public function after(): array
    {
        return [
            function (ValidationValidator $validator): void {
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

    /**
     * Log PHP upload diagnostics when validation fails.
     */
    protected function failedValidation(ValidatorContract $validator): void
    {
        if ($validator->errors()->has('audio')) {
            $file = $this->file('audio');
            $rawFile = $_FILES['audio'] ?? null;
            $rawTmpName = is_array($rawFile) ? (string) ($rawFile['tmp_name'] ?? '') : '';

            $isValidUpload = $file?->isValid() === true;

            Log::warning('Practice session recording upload validation failed.', [
                'practice_session_id' => $this->route('practiceSession') instanceof PracticeSession
                    ? $this->route('practiceSession')->id
                    : null,
                'user_id' => $this->user()?->id,
                'errors' => $validator->errors()->get('audio'),
                'has_file' => $this->hasFile('audio'),
                'uploaded_file_error' => is_array($rawFile) ? ($rawFile['error'] ?? null) : null,
                'uploaded_file_name' => is_array($rawFile) ? ($rawFile['name'] ?? null) : null,
                'uploaded_file_type' => is_array($rawFile) ? ($rawFile['type'] ?? null) : null,
                'uploaded_file_size' => is_array($rawFile) ? ($rawFile['size'] ?? null) : null,
                'uploaded_file_tmp_name' => $rawTmpName ?: null,
                'uploaded_file_tmp_exists' => $rawTmpName !== '' && is_file($rawTmpName),
                'uploaded_file_tmp_readable' => $rawTmpName !== '' && is_readable($rawTmpName),
                'file_is_valid' => $isValidUpload,
                'file_client_error' => $file?->getError(),
                'file_client_name' => $file?->getClientOriginalName(),
                'file_client_mime' => $file?->getClientMimeType(),
                'file_detected_mime' => $this->safeDetectedMimeType($file),
                'file_size' => $this->safeFileSize($file),
                'upload_tmp_dir' => ini_get('upload_tmp_dir') ?: sys_get_temp_dir(),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
                'max_file_uploads' => ini_get('max_file_uploads'),
            ]);
        }

        parent::failedValidation($validator);
    }

    private function safeDetectedMimeType(?UploadedFile $file): ?string
    {
        if (! $this->canInspectUploadedFile($file)) {
            return null;
        }

        try {
            return $file->getMimeType();
        } catch (Throwable) {
            return null;
        }
    }

    private function safeFileSize(?UploadedFile $file): ?int
    {
        if (! $this->canInspectUploadedFile($file)) {
            return null;
        }

        try {
            return $file->getSize();
        } catch (Throwable) {
            return null;
        }
    }

    private function canInspectUploadedFile(?UploadedFile $file): bool
    {
        if (! $file?->isValid()) {
            return false;
        }

        $path = $file->getPathname();

        return $path !== '' && is_file($path) && is_readable($path);
    }
}
