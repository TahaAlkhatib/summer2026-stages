<?php

namespace App\Models;


use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;

class Demand extends Model
{
    // MongoDB'de kolon varsayilan degeri (DEFAULT) yoktur. Eloquent'in
    // $attributes dizisi yeni kayitlara bu degerleri kendisi ekler.
    protected $attributes = [
        'status' => 'aktif',
        'needs_parking' => false,
    ];

    protected $fillable = [
        'customer_id', 'listing_type', 'property_type', 'district',
        'min_price', 'max_price', 'min_area', 'min_room_count',
        'needs_parking', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'min_price' => 'float',
            'max_price' => 'float',
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
        // DİKKAT: MongoDB metinle sayıyı karşılaştırmaz. Tutarlar "decimal"
        // dönüştürücüsü yüzünden metin geldiği için (float) ile çeviriyoruz.
        if ($this->min_price) {
            $sorgu->where('price', '>=', (float) $this->min_price);
        }
        if ($this->max_price) {
            $sorgu->where('price', '<=', (float) $this->max_price);
        }
        if ($this->min_area) {
            $sorgu->where('gross_area', '>=', (int) $this->min_area);
        }
        if ($this->needs_parking) {
            $sorgu->where('has_parking', true);
        }
        $portfoyler = $sorgu->orderBy('price')->get();

        // Oda sayısı "2+1" gibi metin olarak saklanıyor. MongoDB sorgusu içinde
        // metni parçalayıp sayıya çevirmek zor; kayıtları çektikten sonra PHP
        // tarafında süzüyoruz.
        if ($this->min_room_count) {
            $enAz = (int) $this->min_room_count;
            $portfoyler = $portfoyler->filter(function ($portfoy) use ($enAz) {
                $odaSayisi = (int) explode('+', (string) $portfoy->room_count)[0];
                return $odaSayisi >= $enAz;
            })->values();
        }

        return $portfoyler;
    }
}
