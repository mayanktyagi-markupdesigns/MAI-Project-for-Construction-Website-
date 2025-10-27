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
        Schema::create('early_access_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company_name');
            $table->string('email')->unique();
            $table->string('password'); // Will be hashed
            $table->string('years_in_construction'); // e.g., '0-2', '3-5', etc.
            $table->json('usage_plans'); // Array of selected plans, e.g., ["Automate tasks", "Document parsing"]
            $table->boolean('project_management')->default(false); // Yes/No as boolean
            $table->boolean('scheduling_planning')->default(false); // Yes/No as boolean
            $table->boolean('estimating_budgeting')->default(false); // Yes/No as boolean
            $table->boolean('procurement_material')->default(false); // Yes/No as boolean
            $table->boolean('communication_collaboration')->default(false); // Yes/No as boolean
            $table->boolean('quality_safety')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('early_access_requests');
    }
};
