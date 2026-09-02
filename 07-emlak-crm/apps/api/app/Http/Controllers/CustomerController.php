<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $istek)
    {
        $sorgu = Customer::with('agent')->withCount(['demands', 'appointments']);

        if ($istek->filled('q')) {
            $arama = '%' . $istek->q . '%';
            $sorgu->where(function ($s) use ($arama) {
                $s->where('full_name', 'ilike', $arama)->orWhere('phone', 'ilike', $arama);
            });
        }
        if ($istek->filled('agent_id')) {
            $sorgu->where('agent_id', $istek->agent_id);
        }

        return $sorgu->orderBy('full_name')->get();
    }

    public function show(Customer $customer)
    {
        $customer->load(['agent', 'demands']);

        $randevular = $customer->appointments()
            ->with(['property', 'agent'])
            ->orderByDesc('scheduled_at')
            ->get();

        return response()->json([
            'customer' => $customer,
            'appointments' => $randevular,
        ]);
    }

    public function store(Request $istek)
    {
        $veri = $istek->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email',
            'id_number' => 'nullable|string|max:20',
            'source' => 'nullable|in:telefon,web,tabela,tavsiye',
            'notes' => 'nullable|string',
            'agent_id' => 'required|exists:users,id',
        ], [
            'full_name.required' => 'Ad soyad zorunludur.',
            'phone.required' => 'Telefon zorunludur.',
            'agent_id.required' => 'Danışman seçilmelidir.',
        ]);

        return response()->json(Customer::create($veri)->load('agent'), 201);
    }
}
