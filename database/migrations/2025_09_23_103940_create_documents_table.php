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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade'); // Links to projects table
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Uploaded by user
            $table->string('file_name');
            $table->string('folder_name'); // e.g., 'Contracts', 'Specs', 'Submittals' (MODRN structure)
            $table->string('file_type'); // e.g., 'pdf', 'docx'
            $table->timestamp('upload_date');
            $table->boolean('ai_eligible')->default(true); // Per FRD 3.3 for OpenAI parsing
            $table->string('parse_status')->default('Pending'); // Enum: Pending, Processing, Success, Error
            $table->string('drive_file_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
