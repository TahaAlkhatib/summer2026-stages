<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contract extends Model
{
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
            'amount' => 'decimal:2',
            'deposit' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'commission_amount' => 'decimal:2',
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
