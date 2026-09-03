<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;
use MongoDB\Laravel\Relations\HasMany;

class Contract extends Model
{
    // MongoDB'de kolon varsayilan degeri (DEFAULT) yoktur. Eloquent'in
    // $attributes dizisi yeni kayitlara bu degerleri kendisi ekler.
    protected $attributes = [
        'status' => 'aktif',
        // Satis sozlesmesinde bitis tarihi yoktur; alanin cevapta her zaman
        // gorunmesi icin bos deger tanimliyoruz (MongoDB olmayan alani
        // JSON'a hic koymaz).
        'end_date' => null,
        'payment_day' => null,
        'duration_months' => null,
        'deposit' => 0,
        'commission_rate' => 0,
        'commission_amount' => 0,
    ];

    protected $fillable = [
        'code', 'type', 'property_id', 'customer_id', 'owner_id', 'agent_id',
        'start_date', 'end_date', 'amount', 'deposit', 'payment_day',
        'duration_months', 'commission_rate', 'commission_amount',
        'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            // MongoDB'de tutarlar sayi olarak saklanmali. 'decimal:2'
            // donusturucusu degeri metne cevirdigi icin karsilastirma ve
            // toplama islemleri bozulurdu; bu yuzden 'float' kullaniyoruz.
            'amount' => 'float',
            'deposit' => 'float',
            'commission_rate' => 'float',
            'commission_amount' => 'float',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function installments(): HasMany
    {
        return $this->hasMany(Installment::class)->orderBy('sequence');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public static function yeniKod(): string
    {
        $yil = date('Y');
        $adet = static::where('code', 'like', "SZL-$yil-%")->count() + 1;
        return 'SZL-' . $yil . '-' . str_pad($adet, 5, '0', STR_PAD_LEFT);
    }
}
