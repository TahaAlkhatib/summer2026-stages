<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $istek)
    {
        $sorgu = Property::with(['owner', 'agent']);

        if ($istek->filled('q')) {
            // MongoDB'de 'like' operatörü büyük/küçük harf duyarsız bir
            // düzenli ifadeye (regex) çevrilir
            $arama = '%' . $istek->q . '%';
            $sorgu->where(function ($s) use ($arama) {
                $s->where('title', 'like', $arama)
                  ->orWhere('code', 'like', $arama)
                  ->orWhere('district', 'like', $arama)
                  ->orWhere('neighborhood', 'like', $arama);
            });
        }
        if ($istek->filled('listing_type')) {
            $sorgu->where('listing_type', $istek->listing_type);
        }
        if ($istek->filled('property_type')) {
            $sorgu->where('property_type', $istek->property_type);
        }
        if ($istek->filled('district')) {
            $sorgu->where('district', $istek->district);
        }
        if ($istek->filled('status')) {
            $sorgu->where('status', $istek->status);
        }
        if ($istek->filled('agent_id')) {
            $sorgu->where('agent_id', $istek->agent_id);
        }
        if ($istek->filled('max_price')) {
            // MongoDB metinle sayıyı karşılaştırmaz; (float) çevrimi şart
            $sorgu->where('price', '<=', (float) $istek->max_price);
        }

        return $sorgu->orderByDesc('created_at')->limit(200)->get();
    }

    public function show(Property $property)
    {
        $property->load(['owner', 'agent', 'documents.uploader']);

        // Bu portföy için yapılmış randevular
        $randevular = $property->appointments()
            ->with(['customer', 'agent'])
            ->orderByDesc('scheduled_at')
            ->get();

        return response()->json([
            'property' => $property,
            'appointments' => $randevular,
        ]);
    }

    public function store(Request $istek)
    {
        $veri = $istek->validate([
            'title' => 'required|string|max:255',
            'listing_type' => 'required|in:satilik,kiralik',
            'property_type' => 'required|in:daire,villa,isyeri,arsa',
            'district' => 'required|string|max:50',
            'price' => 'required|numeric|min:1',
            'owner_id' => 'required|exists:owners,id',
            'agent_id' => 'required|exists:users,id',
            'city' => 'nullable|string|max:50',
            'neighborhood' => 'nullable|string|max:80',
            'address' => 'nullable|string',
            'room_count' => 'nullable|string|max:10',
            'gross_area' => 'nullable|integer|min:1',
            'floor' => 'nullable|integer',
            'building_age' => 'nullable|integer|min:0',
            'heating' => 'nullable|string|max:30',
            'is_furnished' => 'boolean',
            'has_elevator' => 'boolean',
            'has_parking' => 'boolean',
            'dues' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ], [
            'title.required' => 'İlan başlığı zorunludur.',
            'listing_type.required' => 'Satılık mı kiralık mı seçmelisiniz.',
            'property_type.required' => 'Gayrimenkul tipi zorunludur.',
            'district.required' => 'İlçe zorunludur.',
            'price.required' => 'Fiyat zorunludur.',
            'price.min' => 'Fiyat sıfırdan büyük olmalıdır.',
            'owner_id.required' => 'Mal sahibi seçilmelidir.',
            'agent_id.required' => 'Portföy sorumlusu seçilmelidir.',
        ]);

        $veri['code'] = Property::yeniKod();
        $veri['status'] = 'aktif';

        // MongoDB gelen değeri olduğu gibi saklar. Form'dan metin gelirse
        // fiyat "1500000" diye metin olarak yazılır ve fiyat filtreleri
        // çalışmaz; bu yüzden sayısal alanları burada çeviriyoruz.
        $veri = $this->sayilariCevir($veri);

        $portfoy = Property::create($veri);

        return response()->json($portfoy->load(['owner', 'agent']), 201);
    }

    public function update(Request $istek, Property $property)
    {
        $veri = $istek->validate([
            'title' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:1',
            'status' => 'sometimes|in:aktif,rezerve,satildi,kiralandi,pasif',
            'description' => 'nullable|string',
            'agent_id' => 'sometimes|exists:users,id',
            'room_count' => 'nullable|string|max:10',
            'gross_area' => 'nullable|integer|min:1',
            'dues' => 'nullable|numeric|min:0',
        ]);

        $property->update($this->sayilariCevir($veri));

        return $property->load(['owner', 'agent']);
    }

    public function destroy(Request $istek, Property $property)
    {
        if ($istek->user()->role !== 'admin') {
            return response()->json(['message' => 'Portföy silmek için yönetici olmalısınız.'], 403);
        }
        if ($property->appointments()->exists()) {
            return response()->json([
                'message' => 'Bu portföye ait randevular var, silinemez. Pasife alabilirsiniz.',
            ], 400);
        }

        $property->delete();
        return response()->json(['message' => 'Portföy silindi.']);
    }

    // Sayısal alanları metinden sayıya çevirir (MongoDB için gerekli)
    private function sayilariCevir(array $veri): array
    {
        foreach (['price', 'dues'] as $alan) {
            if (isset($veri[$alan])) {
                $veri[$alan] = (float) $veri[$alan];
            }
        }
        foreach (['gross_area', 'floor', 'building_age'] as $alan) {
            if (isset($veri[$alan])) {
                $veri[$alan] = (int) $veri[$alan];
            }
        }
        return $veri;
    }

    // Filtre kutularını doldurmak için ilçe listesi
    public function districts()
    {
        // MongoDB'de "SELECT DISTINCT" yok; ilçe alanını çekip tekilleştiriyoruz
        return Property::orderBy('district')
            ->pluck('district')
            ->filter()
            ->unique()
            ->values();
    }
}
