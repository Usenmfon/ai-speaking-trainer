<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ContentItemSeeder::class,
            AdminUserSeeder::class,
            UserSeeder::class,
            DemoPracticeSessionSeeder::class,
            DemoFeedbackReportSeeder::class,
        ]);
    }
}
