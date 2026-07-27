<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table): void {
            $table->string('public_speaking_template_key')->nullable()->after('interview_job_description');
            $table->string('public_speaking_template_title')->nullable()->after('public_speaking_template_key');
            $table->text('public_speaking_script')->nullable()->after('public_speaking_template_title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table): void {
            $table->dropColumn([
                'public_speaking_template_key',
                'public_speaking_template_title',
                'public_speaking_script',
            ]);
        });
    }
};
