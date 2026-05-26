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
        Schema::create('speaking_feedback_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('practice_session_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->index()->constrained()->cascadeOnDelete();
            $table->foreignUuid('transcript_id')->constrained('practice_session_transcripts')->cascadeOnDelete();
            $table->unsignedTinyInteger('overall_score')->nullable();
            $table->unsignedTinyInteger('clarity_score')->nullable();
            $table->unsignedTinyInteger('structure_score')->nullable();
            $table->unsignedTinyInteger('confidence_score')->nullable();
            $table->unsignedTinyInteger('pace_score')->nullable();
            $table->unsignedTinyInteger('filler_word_score')->nullable();
            $table->longText('summary_feedback');
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->json('recommendations')->nullable();
            $table->json('filler_words')->nullable();
            $table->longText('improved_version')->nullable();
            $table->string('status')->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();

            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('speaking_feedback_reports');
    }
};
