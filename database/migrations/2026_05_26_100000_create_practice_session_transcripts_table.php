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
        Schema::create('practice_session_transcripts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('practice_session_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->index()->constrained()->cascadeOnDelete();
            $table->foreignUuid('practice_session_recording_id')->nullable()->constrained()->nullOnDelete();
            $table->longText('text');
            $table->json('segments')->nullable();
            $table->string('provider')->nullable();
            $table->timestamp('completed_at');

            $table->index(['user_id', 'completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_session_transcripts');
    }
};
