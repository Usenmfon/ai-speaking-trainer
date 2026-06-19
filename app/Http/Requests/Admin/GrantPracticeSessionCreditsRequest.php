<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GrantPracticeSessionCreditsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:1', 'max:500'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get the validated credit amount.
     */
    public function amount(): int
    {
        return (int) $this->validated('amount');
    }

    /**
     * Get the target user from the route.
     */
    public function targetUser(): User
    {
        $user = $this->route('user');

        if ($user instanceof User) {
            return $user;
        }

        return User::query()->findOrFail($user);
    }
}
