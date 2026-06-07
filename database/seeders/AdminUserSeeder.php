<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the local admin user.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        /** @var User $admin */
        $admin = User::query()->updateOrCreate(
            ['email' => 'usenmfonuko@gmail.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $admin->profile()->updateOrCreate(
            ['user_id' => $admin->id],
            [
                'full_name' => 'Admin User',
                'speaking_level' => 'advanced',
                'main_goal' => 'presentations',
                'preferred_language' => 'English',
                'bio' => 'Seeded admin account for managing the AI Speaking Coach MVP.',
                'onboarding_completed' => true,
            ],
        );

        $admin->syncRoles(Role::findOrCreate('admin', 'web'));
    }
}
