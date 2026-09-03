<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;

class Document extends Model
{
    // MongoDB'de kolon varsayilan degeri (DEFAULT) yoktur. Eloquent'in
    // $attributes dizisi yeni kayitlara bu degerleri kendisi ekler.
    protected $attributes = [
        'file_size' => 0,
    ];

    protected $fillable = [
        'contract_id', 'property_id', 'doc_type', 'title',
        'file_name', 'file_path', 'mime_type', 'file_size',
        'uploaded_by', 'notes',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
