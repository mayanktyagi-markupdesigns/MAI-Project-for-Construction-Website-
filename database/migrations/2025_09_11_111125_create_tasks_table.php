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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('Not Started'); // Enum: Not Started, In Progress, Completed
            $table->date('due_date')->nullable();
            $table->string('priority')->nullable(); // Low, Medium, High (from FRD hints)
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('linked_submittal_id')->nullable()->constrained('submittals')->onDelete('set null');
            $table->foreignId('linked_document_id')->nullable()->constrained('documents')->onDelete('set null');
            $table->foreignId('linked_email_id')->nullable()->constrained('emails')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
