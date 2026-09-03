<?php

namespace App\Http\Controllers;

use App\Models\Installment;
use Illuminate\Http\Request;

class InstallmentController extends Controller
{
    public function index(Request $istek)
    {
        $sorgu = Installment::with(['contract.property', 'contract.customer']);

        if ($istek->filled('contract_id')) {
            $sorgu->where('contract_id', $istek->contract_id);
        }
        if ($istek->filled('status')) {
            $sorgu->where('status', $istek->status);
        }
        if ($istek->filled('period')) {
            $sorgu->where('period', $istek->period);
        }

        // Hatırlatma ekranı: vadesi geçmiş veya yaklaşan ödemeler
        if ($istek->boolean('reminders')) {
            $gun = (int) $istek->input('days', 7);
            $sorgu->where('status', '!=', 'odendi')
                  ->where('status', '!=', 'iptal')
                  // due_date "2026-09-05" biciminde metin olarak saklanir;
                  // bu bicimdeki metinler alfabetik siralandiginda tarih sirasi
                  // ile ayni oldugu icin dogrudan karsilastirabiliyoruz.
                  ->where('due_date', '<=', now()->addDays($gun)->toDateString());
        }

        $taksitler = $sorgu->orderBy('due_date')->limit(300)->get();

        return $taksitler->map(function ($t) {
            $veri = $t->toArray();
            $veri['is_overdue'] = $t->gecikmisMi();
            $veri['remaining'] = $t->kalan();
            // Vadeye kaç gün kaldı (eksi ise gecikmiş)
            $veri['days_left'] = (int) now()->startOfDay()->diffInDays($t->due_date, false);
            return $veri;
        });
    }

    public function pay(Request $istek, Installment $installment)
    {
        if ($installment->status === 'odendi') {
            return response()->json(['message' => 'Bu taksit zaten ödenmiş.'], 400);
        }
        if ($installment->status === 'iptal') {
            return response()->json(['message' => 'İptal edilmiş taksit tahsil edilemez.'], 400);
        }

        $veri = $istek->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|in:nakit,havale,kredi_karti',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ], [
            'amount.required' => 'Tahsilat tutarı zorunludur.',
            'amount.min' => 'Tutar sıfırdan büyük olmalıdır.',
        ]);

        $kalan = $installment->kalan();
        if ($veri['amount'] > $kalan + 0.01) {
            return response()->json([
                'message' => 'Tahsilat kalan tutardan fazla olamaz. Kalan: '
                    . number_format($kalan, 2, ',', '.') . ' ₺',
            ], 422);
        }

        $yeniOdenen = (float) $installment->paid_amount + (float) $veri['amount'];
        $tamOdendi = $yeniOdenen >= (float) $installment->amount - 0.01;

        $installment->update([
            'paid_amount' => $yeniOdenen,
            'paid_at' => $tamOdendi ? ($veri['paid_at'] ?? now()->toDateString()) : null,
            'payment_method' => $veri['payment_method'] ?? 'nakit',
            'status' => $tamOdendi ? 'odendi' : 'bekliyor',
            'notes' => $veri['notes'] ?? $installment->notes,
        ]);

        return response()->json([
            'installment' => $installment->fresh(),
            'message' => $tamOdendi
                ? 'Taksit tamamen ödendi.'
                : 'Kısmi tahsilat kaydedildi. Kalan: '
                    . number_format($installment->kalan(), 2, ',', '.') . ' ₺',
        ]);
    }

    // Vadesi geçmiş taksitleri "gecikti" olarak işaretler.
    // Gerçek projede zamanlanmış görev (scheduler) ile çalışır.
    public function refreshOverdue()
    {
        $adet = Installment::where('status', 'bekliyor')
            ->where('due_date', '<', now()->toDateString())
            ->update(['status' => 'gecikti']);

        return response()->json([
            'updated' => $adet,
            'message' => $adet . ' taksit gecikmiş olarak işaretlendi.',
        ]);
    }
}
