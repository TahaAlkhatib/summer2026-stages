<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;

class Installment extends Model
{
    // MongoDB'de kolon varsayilan degeri (DEFAULT) yoktur. Eloquent'in
    // $attributes dizisi yeni kayitlara bu degerleri kendisi ekler.
    protected $attributes = [
        'status' => 'bekliyor',
        'paid_amount' => 0,
    ];

    protected $fillable = [
        'contract_id', 'period', 'sequence', 'due_date', 'amount',
        'paid_amount', 'paid_at', 'payment_method', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
            'paid_at' => 'date:Y-m-d',
            'amount' => 'float',
            'paid_amount' => 'float',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    // Kalan tutar
    public function kalan(): float
    {
        return (float) $this->amount - (float) $this->paid_amount;
    }

    // Vadesi geçmiş mi? (ödenmemiş ve vade tarihi bugünden önce)
    public function gecikmisMi(): bool
    {
        return $this->status !== 'odendi' && $this->due_date->isPast();
    }
}
