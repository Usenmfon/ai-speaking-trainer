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
            $table->string('interview_role_title')->nullable()->after('objective');
            $table->string('interview_company')->nullable()->after('interview_role_title');
            $table->string('interview_stage')->nullable()->after('interview_company');
            $table->string('interview_question_type')->nullable()->after('interview_stage');
            $table->text('interview_job_description')->nullable()->after('interview_question_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table): void {
            $table->dropColumn([
                'interview_role_title',
                'interview_company',
                'interview_stage',
                'interview_question_type',
                'interview_job_description',
            ]);
        });
    }
};
