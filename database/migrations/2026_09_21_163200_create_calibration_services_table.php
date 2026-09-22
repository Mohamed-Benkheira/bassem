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
        Schema::create('calibration_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('equipment_type');
            $table->text('description')->nullable();
            $table->string('measurement_category'); // e.g. Pression, Température, Électricité, Pesage, Dimensionnel
            $table->string('calibration_type'); // Laboratoire, Sur site, Laboratoire & Sur site
            $table->string('method')->nullable(); // Norme / Procédure de calibration
            $table->text('required_info')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calibration_services');
    }
};
