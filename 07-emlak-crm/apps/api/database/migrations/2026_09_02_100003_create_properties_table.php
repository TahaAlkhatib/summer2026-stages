<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Portföy (ilan) kayıtları
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();           // PRT-2026-00001
            $table->string('title');
            $table->string('listing_type', 20);             // satilik | kiralik
            $table->string('property_type', 30);            // daire | villa | isyeri | arsa
            $table->string('city', 50)->default('İstanbul');
            $table->string('district', 50);
            $table->string('neighborhood', 80)->nullable();
            $table->string('address')->nullable();
            $table->string('room_count', 10)->nullable();   // 1+1, 2+1, 3+1...
            $table->integer('gross_area')->nullable();      // m²
            $table->integer('floor')->nullable();
            $table->integer('building_age')->nullable();
            $table->string('heating', 30)->nullable();
            $table->boolean('is_furnished')->default(false);
            $table->boolean('has_elevator')->default(false);
            $table->boolean('has_parking')->default(false);
            $table->decimal('price', 14, 2);
            $table->decimal('dues', 10, 2)->default(0);     // aidat
            // aktif | rezerve | satildi | kiralandi | pasif
            $table->string('status', 20)->default('aktif');
            $table->text('description')->nullable();
            $table->foreignId('owner_id')->constrained('owners');
            $table->foreignId('agent_id')->constrained('users');   // portföy sorumlusu
            $table->timestamps();

            $table->index(['listing_type', 'status']);
            $table->index('district');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
