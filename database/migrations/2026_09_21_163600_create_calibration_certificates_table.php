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
        Schema::create('calibration_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_number')->unique();
            $table->foreignId('calibration_operation_id')->constrained('calibration_operations')->cascadeOnDelete();
            $table->foreignId('calibration_request_id')->constrained('calibration_requests')->cascadeOnDelete();
            $table->foreignId('calibration_request_item_id')->constrained('calibration_request_items')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('calibration_report_id')->nullable()->constrained('calibration_reports')->nullOnDelete();
            $table->foreignId('generated_by_id')->constrained('users')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->string('status')->default('DRAFT'); // DRAFT, VALIDATED
            $table->foreignId('validated_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();
            $table->boolean('is_final')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calibration_certificates');
    }
};
