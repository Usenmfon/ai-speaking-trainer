<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_seeder_creates_admin_with_permissions(): void
    {
        $this->seed([
            RoleSeeder::class,
            AdminUserSeeder::class,
        ]);

        $admin = User::query()
            ->where('email', 'admin@example.com')
            ->firstOrFail();

        $this->assertTrue($admin->hasRole('admin'));
        $this->assertSame(
            collect(RoleSeeder::ADMIN_PERMISSIONS)->sort()->values()->all(),
            $admin->getAllPermissions()->pluck('name')->sort()->values()->all(),
        );
        $this->assertTrue($admin->profile?->onboarding_completed);
        $this->assertSame('advanced', $admin->profile?->speaking_level);
    }

    public function test_user_seeder_only_creates_demo_user(): void
    {
        $this->seed([
            RoleSeeder::class,
            UserSeeder::class,
        ]);

        $demo = User::query()
            ->where('email', 'test@example.com')
            ->firstOrFail();

        $this->assertTrue($demo->hasRole('user'));
        $this->assertFalse(User::query()->where('email', 'admin@example.com')->exists());
    }
}
