<?php

namespace App\Http\Controllers;

use App\Models\Demand;
use Illuminate\Http\Request;

class DemandController extends Controller
{
    public function index(Request $istek)
    {
        $sorgu = Demand::with('customer.agent');

        if ($istek->filled('status')) {
            $sorgu->where('status', $istek->status);
        }
        if ($istek->filled('customer_id')) {
            $sorgu->where('customer_id', $istek->customer_id);
        }

        $talepler = $sorgu->orderByDesc('created_at')->get();

        // Listede kaç portföyle eşleştiğini de gösteriyoruz
        return $talepler->map(function ($talep) {
            $veri = $talep->toArray();
            $veri['match_count'] = $talep->status === 'aktif'
                ? $talep->eslesenPortfoyler()->count()
                : 0;
            return $veri;
        });
    }

    public function store(Request $istek)
    {
        $veri = $istek->validate([
            'customer_id' => 'required|exists:customers,id',
            'listing_type' => 'required|in:satilik,kiralik',
            'property_type' => 'nullable|in:daire,villa,isyeri,arsa',
            'district' => 'nullable|string|max:50',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'min_area' => 'nullable|integer|min:0',
            'min_room_count' => 'nullable|string|max:10',
            'needs_parking' => 'boolean',
            'notes' => 'nullable|string',
        ], [
            'customer_id.required' => 'Müşteri seçilmelidir.',
            'listing_type.required' => 'Satılık mı kiralık mı seçmelisiniz.',
        ]);

        if (!empty($veri['min_price']) && !empty($veri['max_price'])
            && $veri['min_price'] > $veri['max_price']) {
            return response()->json([
                'message' => 'En düşük fiyat, en yüksek fiyattan büyük olamaz.',
            ], 422);
        }

        $veri['status'] = 'aktif';

        return response()->json(Demand::create($veri)->load('customer'), 201);
    }

    // Otomatik eşleştirme — talebe uyan aktif portföyler
    public function matches(Demand $demand)
    {
        return response()->json([
            'demand' => $demand->load('customer.agent'),
            'matches' => $demand->eslesenPortfoyler(),
        ]);
    }

    public function close(Demand $demand)
    {
        $demand->update(['status' => 'kapali']);
        return response()->json(['message' => 'Talep kapatıldı.']);
    }
}
