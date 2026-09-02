<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Demand extends Model
{
    protected $fillable = [
        'customer_id', 'listing_type', 'property_type', 'district',
        'min_price', 'max_price', 'min_area', 'min_room_count',
        'needs_parking', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'min_price' => 'decimal:2',
            'max_price' => 'decimal:2',
            'needs_parking' => 'boolean',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    // Bu talebe uyan aktif portföyleri bulur (otomatik eşleştirme).
    // Boş bırakılan kriterler dikkate alınmaz.
    public function eslesenPortfoyler()
    {
        $sorgu = Property::with(['owner', 'agent'])
            ->where('status', 'aktif')
            ->where('listing_type', $this->listing_type);

        if ($this->property_type) {
            $sorgu->where('property_type', $this->property_type);
        }
        if ($this->district) {
            $sorgu->where('district', $this->district);
        }
        if ($this->min_price) {
            $sorgu->where('price', '>=', $this->min_price);
        }
        if ($this->max_price) {
            $sorgu->where('price', '<=', $this->max_price);
        }
        if ($this->min_area) {
            $sorgu->where('gross_area', '>=', $this->min_area);
        }
        if ($this->needs_parking) {
            $sorgu->where('has_parking', true);
        }
        // Oda sayısı "2+1" gibi metin; ilk rakamı sayıya çevirip karşılaştırıyoruz
        if ($this->min_room_count) {
            $enAz = (int) $this->min_room_count;
            $sorgu->whereRaw("CAST(split_part(room_count, '+', 1) AS INTEGER) >= ?", [$enAz]);
        }

        return $sorgu->orderBy('price')->get();
    }
}
