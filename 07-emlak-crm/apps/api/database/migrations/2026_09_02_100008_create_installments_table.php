<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Kira taksit takvimi — sözleşme açılınca otomatik üretilir
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->string('period', 7);                  // 2026-09
            $table->integer('sequence');                  // kaçıncı taksit
            $table->date('due_date');
            $table->decimal('amount', 14, 2);
            $table->decimal('paid_amount', 14, 2)->default(0);
            $table->date('paid_at')->nullable();
            $table->string('payment_method', 20)->nullable(); // nakit | havale | kredi_karti
            // bekliyor | odendi | gecikti
            $table->string('status', 20)->default('bekliyor');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installments');
    }
};
