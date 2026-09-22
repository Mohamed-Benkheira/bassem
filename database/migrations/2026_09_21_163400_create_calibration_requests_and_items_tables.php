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
        Schema::create('calibration_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('SUBMITTED');
            $table->date('preferred_date')->nullable();
            $table->string('preferred_location')->default('laboratory'); // laboratory, client_site
            $table->text('client_notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->date('proposed_date')->nullable();
            $table->string('proposed_location')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->string('scheduled_location')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('calibration_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calibration_request_id')->constrained('calibration_requests')->cascadeOnDelete();
            $table->foreignId('calibration_service_id')->constrained('calibration_services')->cascadeOnDelete();
            $table->string('equipment_name');
            $table->string('serial_number')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('measurement_range')->nullable();
            $table->string('tolerance')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->text('specific_notes')->nullable();
            $table->string('status')->default('PENDING'); // PENDING, SCHEDULED, IN_CALIBRATION, COMPLETED, CANCELLED
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calibration_request_items');
        Schema::dropIfExists('calibration_requests');
    }
};
