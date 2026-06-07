<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    public const ADMIN_PERMISSIONS = [
        'admin.dashboard.view',
        'admin.users.view',
        'admin.sessions.view',
        'admin.content.manage',
        'admin.processing.manage',
        'admin.notifications.manage',
        'admin.settings.manage',
        'admin.audit-logs.view',
    ];

    /**
     * Seed application roles.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $adminPermissions = collect(self::ADMIN_PERMISSIONS)
            ->map(fn (string $permission): Permission => Permission::findOrCreate($permission, 'web'));

        Role::findOrCreate('admin', 'web')->syncPermissions($adminPermissions);
        Role::findOrCreate('user', 'web');

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
