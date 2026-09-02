<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Installment extends Model
{
    protected $fillable = [
        'contract_id', 'period', 'sequence', 'due_date', 'amount',
        'paid_amount', 'paid_at', 'payment_method', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
            'paid_at' => 'date:Y-m-d',
            'amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
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
