<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Satış ve kira sözleşmeleri
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();          // SZL-2026-00001
            $table->string('type', 20);                    // satis | kira
            $table->foreignId('property_id')->constrained('properties');
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('owner_id')->constrained('owners');
            $table->foreignId('agent_id')->constrained('users');

            $table->date('start_date');
            $table->date('end_date')->nullable();          // kira sözleşmesinde dolu
            $table->decimal('amount', 14, 2);              // satış bedeli veya aylık kira
            $table->decimal('deposit', 14, 2)->default(0); // depozito
            $table->integer('payment_day')->nullable();    // her ayın kaçında ödenecek
            $table->integer('duration_months')->nullable();

            $table->decimal('commission_rate', 5, 2)->default(0);   // %
            $table->decimal('commission_amount', 14, 2)->default(0);

            // aktif | bitti | feshedildi
            $table->string('status', 20)->default('aktif');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
