<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Yerinde görüntüleme randevuları
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties');
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('agent_id')->constrained('users');
            $table->dateTime('scheduled_at');
            // planlandi | gerceklesti | iptal
            $table->string('status', 20)->default('planlandi');
            // dusuk | orta | yuksek — görüşme sonrası ilgi seviyesi
            $table->string('interest_level', 20)->nullable();
            $table->text('result_note')->nullable();
            $table->timestamps();

            $table->index('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
