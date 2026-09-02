<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    protected $fillable = [
        'code', 'title', 'listing_type', 'property_type', 'city', 'district',
        'neighborhood', 'address', 'room_count', 'gross_area', 'floor',
        'building_age', 'heating', 'is_furnished', 'has_elevator', 'has_parking',
        'price', 'dues', 'status', 'description', 'owner_id', 'agent_id',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'dues' => 'decimal:2',
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
