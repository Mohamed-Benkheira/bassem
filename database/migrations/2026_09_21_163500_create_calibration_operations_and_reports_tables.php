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
        Schema::create('calibration_operations', function (Blueprint $table) {
            $table->id();
            $table->string('operation_number')->unique();
            $table->foreignId('calibration_request_id')->constrained('calibration_requests')->cascadeOnDelete();
            $table->foreignId('calibration_request_item_id')->constrained('calibration_request_items')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('technician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('scheduled_date')->nullable();
            $table->date('actual_date')->nullable();
            $table->string('location')->default('laboratory'); // laboratory, client_site
            $table->string('status')->default('SCHEDULED'); // SCHEDULED, ASSIGNED, IN_PROGRESS, REPORT_UPLOADED, REPORT_REJECTED, CERTIFICATE_GENERATED, COMPLETED, CANCELLED
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('calibration_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_number')->unique();
            $table->foreignId('calibration_operation_id')->constrained('calibration_operations')->cascadeOnDelete();
            $table->foreignId('calibration_request_id')->constrained('calibration_requests')->cascadeOnDelete();
            $table->foreignId('calibration_request_item_id')->constrained('calibration_request_items')->cascadeOnDelete();
            $table->foreignId('uploaded_by_id')->constrained('users')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->string('status')->default('PENDING_REVIEW'); // PENDING_REVIEW, APPROVED, REJECTED
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calibration_reports');
        Schema::dropIfExists('calibration_operations');
    }
};
