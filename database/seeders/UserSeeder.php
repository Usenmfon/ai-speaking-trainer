<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed local demo users.
     */
    public function run(): void
    {
        $admin = $this->createUser(
            name: 'Admin User',
            email: 'admin@example.com',
        );
        $admin->assignRole(Role::findOrCreate('admin', 'web'));

        $demo = $this->createUser(
            name: 'Test User',
            email: 'test@example.com',
        );
        $demo->assignRole(Role::findOrCreate('user', 'web'));
    }

    /**
     * Create or update a seeded user with a completed profile.
     */
    private function createUser(string $name, string $email): User
    {
        /** @var User $user */
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'full_name' => $name,
                'speaking_level' => $email === 'admin@example.com' ? 'advanced' : 'intermediate',
                'main_goal' => $email === 'admin@example.com' ? 'presentations' : 'public_speaking',
                'preferred_language' => 'English',
                'bio' => 'Seeded account for testing the AI Speaking Coach MVP.',
                'onboarding_completed' => true,
            ],
        );

        return $user;
    }
}
