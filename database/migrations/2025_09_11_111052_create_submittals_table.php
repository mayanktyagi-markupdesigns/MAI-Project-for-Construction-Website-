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
        Schema::create('submittals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('spec_section_number'); // e.g., '09 51 13'
            $table->text('description');
            $table->string('responsible_party');
            $table->string('status')->default('Not Started'); // Enum: Not Started, Submitted, Approved
            $table->text('notes')->nullable();
            $table->foreignId('linked_document_id')->nullable()->constrained('documents')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submittals');
    }
};
