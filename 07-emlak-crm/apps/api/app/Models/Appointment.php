<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'property_id', 'customer_id', 'agent_id', 'scheduled_at',
        'status', 'interest_level', 'result_note',
    ];

    protected function casts(): array
    {
        // Yerel saat olarak gonderiyoruz; UTC'ye cevrilirse saat kayar
        return ['scheduled_at' => 'datetime:Y-m-d H:i'];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
