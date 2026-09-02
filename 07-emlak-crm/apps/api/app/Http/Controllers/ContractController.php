<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Installment;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    public function index(Request $istek)
    {
        $sorgu = Contract::with(['property', 'customer', 'owner', 'agent']);

        if ($istek->filled('type')) {
            $sorgu->where('type', $istek->type);
        }
        if ($istek->filled('status')) {
            $sorgu->where('status', $istek->status);
        }

        return $sorgu->orderByDesc('created_at')->get();
    }

    public function show(Contract $contract)
    {
        $contract->load([
            'property.owner', 'customer', 'owner', 'agent',
            'installments', 'documents.uploader',
        ]);

        $taksitler = $contract->installments;
        $toplam = (float) $taksitler->sum('amount');
        $tahsil = (float) $taksitler->sum('paid_amount');

        return response()->json([
            'contract' => $contract,
            'totals' => [
                'total' => $toplam,
                'paid' => $tahsil,
                'remaining' => $toplam - $tahsil,
                'overdue_count' => $taksitler->filter(fn ($t) => $t->gecikmisMi())->count(),
            ],
        ]);
    }

    public function store(Request $istek)
    {
        $veri = $istek->validate([
            'type' => 'required|in:satis,kira',
            'property_id' => 'required|exists:properties,id',
            'customer_id' => 'required|exists:customers,id',
            'agent_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'amount' => 'required|numeric|min:1',
            'deposit' => 'nullable|numeric|min:0',
            'duration_months' => 'nullable|integer|min:1|max:120',
            'payment_day' => 'nullable|integer|min:1|max:28',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ], [
            'type.required' => 'Sözleşme tipi seçilmelidir.',
            'property_id.required' => 'Portföy seçilmelidir.',
            'customer_id.required' => 'Müşteri seçilmelidir.',
            'start_date.required' => 'Başlangıç tarihi zorunludur.',
            'amount.required' => 'Tutar zorunludur.',
            'payment_day.max' => 'Ödeme günü en fazla 28 olabilir (şubat ayı için).',
        ]);

        $portfoy = Property::findOrFail($veri['property_id']);

        if (in_array($portfoy->status, ['satildi', 'kiralandi'])) {
            return response()->json([
                'message' => $portfoy->code . ' numaralı portföy zaten ' .
                    ($portfoy->status === 'satildi' ? 'satılmış' : 'kiralanmış') . '.',
            ], 400);
        }

        if ($veri['type'] === 'kira' && empty($veri['duration_months'])) {
            return response()->json([
                'message' => 'Kira sözleşmesinde süre (ay) zorunludur.',
            ], 422);
        }

        $oran = (float) ($veri['commission_rate'] ?? 0);

        // Komisyon: satışta bedel üzerinden, kirada bir aylık kira üzerinden
        $komisyon = $veri['type'] === 'satis'
            ? $veri['amount'] * $oran / 100
            : $veri['amount'] * $oran / 100;

        $sozlesme = DB::transaction(function () use ($veri, $portfoy, $oran, $komisyon) {
            $sure = (int) ($veri['duration_months'] ?? 0);

            $sozlesme = Contract::create([
                'code' => Contract::yeniKod(),
                'type' => $veri['type'],
                'property_id' => $portfoy->id,
                'customer_id' => $veri['customer_id'],
                'owner_id' => $portfoy->owner_id,
                'agent_id' => $veri['agent_id'],
                'start_date' => $veri['start_date'],
                'end_date' => $veri['type'] === 'kira'
                    ? date('Y-m-d', strtotime($veri['start_date'] . " +$sure months -1 day"))
                    : null,
                'amount' => $veri['amount'],
                'deposit' => $veri['deposit'] ?? 0,
                'payment_day' => $veri['payment_day'] ?? null,
                'duration_months' => $sure ?: null,
                'commission_rate' => $oran,
                'commission_amount' => $komisyon,
                'status' => 'aktif',
                'notes' => $veri['notes'] ?? null,
            ]);

            // Kira sözleşmesinde taksit takvimi OTOMATIK üretilir
            if ($veri['type'] === 'kira') {
                $this->taksitleriOlustur($sozlesme);
            }

            $portfoy->update([
                'status' => $veri['type'] === 'satis' ? 'satildi' : 'kiralandi',
            ]);

            return $sozlesme;
        });

        return response()->json(
            $sozlesme->load(['property', 'customer', 'owner', 'agent', 'installments']),
            201
        );
    }

    // Aylık kira taksitlerini üretir
    private function taksitleriOlustur(Contract $sozlesme): void
    {
        $odemeGunu = $sozlesme->payment_day ?: (int) $sozlesme->start_date->format('j');

        for ($i = 0; $i < $sozlesme->duration_months; $i++) {
            // Ay ay ilerlerken gün taşmasını önlemek için ayın 1'inden hesaplıyoruz
            $ayBasi = $sozlesme->start_date->copy()->startOfMonth()->addMonths($i);
            $vade = $ayBasi->copy()->day(min($odemeGunu, $ayBasi->daysInMonth));

            Installment::create([
                'contract_id' => $sozlesme->id,
                'period' => $ayBasi->format('Y-m'),
                'sequence' => $i + 1,
                'due_date' => $vade->toDateString(),
                'amount' => $sozlesme->amount,
                'status' => 'bekliyor',
            ]);
        }
    }

    public function terminate(Request $istek, Contract $contract)
    {
        if ($contract->status !== 'aktif') {
            return response()->json(['message' => 'Bu sözleşme zaten kapalı.'], 400);
        }

        DB::transaction(function () use ($contract, $istek) {
            $contract->update([
                'status' => 'feshedildi',
                'notes' => trim(($contract->notes ?? '') . "\nFesih: " . $istek->input('reason', '-')),
            ]);

            // Ödenmemiş taksitler iptal olsun
            $contract->installments()
                ->where('status', '!=', 'odendi')
                ->update(['status' => 'iptal']);

            // Portföy tekrar satışa/kiraya açılır
            $contract->property()->update(['status' => 'aktif']);
        });

        return response()->json(['message' => 'Sözleşme feshedildi, portföy tekrar aktif.']);
    }
}
