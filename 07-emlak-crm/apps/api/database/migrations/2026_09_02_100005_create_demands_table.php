<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Müşteri talepleri — portföyle otomatik eşleştirmede kullanılır
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('listing_type', 20);              // satilik | kiralik
            $table->string('property_type', 30)->nullable(); // daire | villa | isyeri | arsa
            $table->string('district', 50)->nullable();
            $table->decimal('min_price', 14, 2)->nullable();
            $table->decimal('max_price', 14, 2)->nullable();
            $table->integer('min_area')->nullable();
            $table->string('min_room_count', 10)->nullable();
            $table->boolean('needs_parking')->default(false);
            $table->string('status', 20)->default('aktif');  // aktif | kapali
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demands');
    }
};
