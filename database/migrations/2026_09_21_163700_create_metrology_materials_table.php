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
        Schema::create('metrology_materials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('reference_code')->unique();
            $table->string('serial_number')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->string('category'); // e.g. Étalon de pression, Sonde thermométrique, Multimètre de précision
            $table->date('calibration_date')->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('status')->default('VALID'); // VALID, EXPIRED, UNDER_MAINTENANCE
            $table->string('location')->nullable();
            $table->string('supporting_document_path')->nullable();
            $table->string('supporting_document_name')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metrology_materials');
    }
};
