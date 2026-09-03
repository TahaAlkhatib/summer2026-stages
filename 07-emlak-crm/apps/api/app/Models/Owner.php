<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\HasMany;

class Owner extends Model
{
    protected $fillable = ['full_name', 'phone', 'email', 'id_number', 'iban', 'notes'];

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
