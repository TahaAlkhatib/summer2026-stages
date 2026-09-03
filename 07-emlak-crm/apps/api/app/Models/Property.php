<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;
use MongoDB\Laravel\Relations\HasMany;

class Property extends Model
{
    // MongoDB'de kolon varsayilan degeri (DEFAULT) yoktur. Eloquent'in
    // $attributes dizisi yeni kayitlara bu degerleri kendisi ekler.
    protected $attributes = [
        'city' => 'İstanbul',
        'status' => 'aktif',
        'is_furnished' => false,
        'has_elevator' => false,
        'has_parking' => false,
        'dues' => 0,
    ];

    protected $fillable = [
        'code', 'title', 'listing_type', 'property_type', 'city', 'district',
        'neighborhood', 'address', 'room_count', 'gross_area', 'floor',
        'building_age', 'heating', 'is_furnished', 'has_elevator', 'has_parking',
        'price', 'dues', 'status', 'description', 'owner_id', 'agent_id',
    ];

    protected function casts(): array
    {
        return [
            // Tutarlar MongoDB'de sayi olarak saklanir (bkz. db/README.md)
            'price' => 'float',
            'dues' => 'float',
            'is_furnished' => 'boolean',
            'has_elevator' => 'boolean',
            'has_parking' => 'boolean',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    // Sıradaki portföy kodunu üretir: PRT-2026-00001
    public static function yeniKod(): string
    {
        $yil = date('Y');
        $adet = static::where('code', 'like', "PRT-$yil-%")->count() + 1;
        return 'PRT-' . $yil . '-' . str_pad($adet, 5, '0', STR_PAD_LEFT);
    }
}
