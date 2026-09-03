<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    public function index(Request $istek)
    {
        $sorgu = Owner::withCount('properties');

        if ($istek->filled('q')) {
            $arama = '%' . $istek->q . '%';
            $sorgu->where(function ($s) use ($arama) {
                $s->where('full_name', 'like', $arama)->orWhere('phone', 'like', $arama);
            });
        }

        return $sorgu->orderBy('full_name')->get();
    }

    public function store(Request $istek)
    {
        $veri = $istek->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email',
            'id_number' => 'nullable|string|max:20',
            'iban' => 'nullable|string|max:40',
            'notes' => 'nullable|string',
        ], [
            'full_name.required' => 'Ad soyad zorunludur.',
            'phone.required' => 'Telefon zorunludur.',
            'email.email' => 'Geçerli bir e-posta adresi girin.',
        ]);

        return response()->json(Owner::create($veri), 201);
    }
}
