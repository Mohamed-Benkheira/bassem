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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_number')->unique();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('calibration_request_id')->nullable()->constrained('calibration_requests')->nullOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('currency')->default('EUR');
            $table->string('status')->default('DRAFT'); // DRAFT, SENT, ACCEPTED, REJECTED
            $table->string('document_path')->nullable();
            $table->string('document_name')->nullable();
            $table->date('validity_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
