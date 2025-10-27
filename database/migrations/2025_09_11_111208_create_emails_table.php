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
        Schema::create('emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('cascade');
            $table->text('subject');
            $table->string('sender_email');
            $table->timestamp('date_time');
            $table->text('body')->nullable(); // Extracted body
            $table->json('attachments')->nullable(); // Array of file IDs or paths
            $table->string('parse_status')->default('Pending');
            $table->foreignId('linked_submittal_id')->nullable()->constrained('submittals')->onDelete('set null');
            $table->foreignId('linked_task_id')->nullable()->constrained('tasks')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emails');
    }
};
