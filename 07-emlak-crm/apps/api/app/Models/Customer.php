<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;
use MongoDB\Laravel\Relations\HasMany;

class Customer extends Model
{
    // MongoDB'de kolon varsayilan degeri (DEFAULT) yoktur. Eloquent'in
    // $attributes dizisi yeni kayitlara bu degerleri kendisi ekler.
    protected $attributes = [
        'source' => 'telefon',
    ];

    protected $fillable = [
        'full_name', 'phone', 'email', 'id_number', 'source', 'notes', 'agent_id',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function demands(): HasMany
    {
        return $this->hasMany(Demand::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
