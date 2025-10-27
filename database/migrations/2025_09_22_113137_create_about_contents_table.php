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
        Schema::create('about_contents', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->text('content')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('about_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('about_content_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('video')->nullable(); // Assuming video is a URL or path
            $table->timestamps();
        });

        Schema::create('about_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('about_stage_id')->constrained()->onDelete('cascade');
            $table->text('point');
            $table->timestamps();
        });

        Schema::create('about_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('about_content_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('about_points');
        Schema::dropIfExists('about_stages');
        Schema::dropIfExists('about_cards');
        Schema::dropIfExists('about_contents');
    }
};
