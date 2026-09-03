<?php

use Illuminate\Database\Migrations\Migration;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// MongoDB'de tablo/kolon tanımı yoktur; koleksiyonlar ilk kayıtta kendiliğinden
// oluşur. Bu göç yalnızca sık kullanılan alanlara **indeks** ekler ve benzersiz
// olması gereken alanları (portföy kodu, sözleşme kodu, e-posta) korur.
// Alanların listesi modellerin $fillable dizisinde ve db/README.md dosyasındadır.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $koleksiyon) {
            $koleksiyon->unique('email');
        });

        Schema::create('personal_access_tokens', function (Blueprint $koleksiyon) {
            $koleksiyon->unique('token');
            $koleksiyon->index('tokenable_id');
        });

        Schema::create('owners', function (Blueprint $koleksiyon) {
            $koleksiyon->index('phone');
        });

        Schema::create('properties', function (Blueprint $koleksiyon) {
            $koleksiyon->unique('code');
            $koleksiyon->index(['listing_type', 'status']);
            $koleksiyon->index('district');
            $koleksiyon->index('agent_id');
        });

        Schema::create('customers', function (Blueprint $koleksiyon) {
            $koleksiyon->index('phone');
            $koleksiyon->index('agent_id');
        });

        Schema::create('demands', function (Blueprint $koleksiyon) {
            $koleksiyon->index('customer_id');
            $koleksiyon->index('status');
        });

        Schema::create('appointments', function (Blueprint $koleksiyon) {
            $koleksiyon->index('scheduled_at');
            $koleksiyon->index('agent_id');
        });

        Schema::create('contracts', function (Blueprint $koleksiyon) {
            $koleksiyon->unique('code');
            $koleksiyon->index('status');
        });

        Schema::create('installments', function (Blueprint $koleksiyon) {
            $koleksiyon->index(['status', 'due_date']);
            $koleksiyon->index('contract_id');
            $koleksiyon->index('period');
        });

        Schema::create('documents', function (Blueprint $koleksiyon) {
            $koleksiyon->index('contract_id');
            $koleksiyon->index('property_id');
        });
    }

    public function down(): void
    {
        foreach ([
            'documents', 'installments', 'contracts', 'appointments', 'demands',
            'customers', 'properties', 'owners', 'personal_access_tokens', 'users',
        ] as $koleksiyon) {
            Schema::dropIfExists($koleksiyon);
        }
    }
};
