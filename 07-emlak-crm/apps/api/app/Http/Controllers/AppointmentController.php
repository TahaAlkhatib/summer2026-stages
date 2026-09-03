<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $istek)
    {
        $sorgu = Appointment::with(['property', 'customer', 'agent']);

        if ($istek->filled('status')) {
            $sorgu->where('status', $istek->status);
        }
        if ($istek->filled('agent_id')) {
            $sorgu->where('agent_id', $istek->agent_id);
        }
        // Mobil uygulama "bugünkü randevularım" için mine=1&date=bugun gönderiyor
        if ($istek->boolean('mine')) {
            $sorgu->where('agent_id', $istek->user()->id);
        }
        if ($istek->filled('date')) {
            $sorgu->whereDate('scheduled_at', $istek->date);
        }
        if ($istek->filled('from')) {
            $sorgu->whereDate('scheduled_at', '>=', $istek->from);
        }
        if ($istek->filled('to')) {
            $sorgu->whereDate('scheduled_at', '<=', $istek->to);
        }

        return $sorgu->orderBy('scheduled_at')->limit(300)->get();
    }

    public function store(Request $istek)
    {
        $veri = $istek->validate([
            'property_id' => 'required|exists:properties,id',
            'customer_id' => 'required|exists:customers,id',
            'agent_id' => 'required|exists:users,id',
            'scheduled_at' => 'required|date',
        ], [
            'property_id.required' => 'Portföy seçilmelidir.',
            'customer_id.required' => 'Müşteri seçilmelidir.',
            'agent_id.required' => 'Danışman seçilmelidir.',
            'scheduled_at.required' => 'Randevu tarihi ve saati zorunludur.',
        ]);

        // DİKKAT: MongoDB'de tarih alanı gerçek bir tarih tipiyle saklanmalı.
        // Metin olarak kaydedilirse tarih filtreleri (whereDate) çalışmaz.
        $randevuZamani = Carbon::parse($veri['scheduled_at']);
        $veri['scheduled_at'] = $randevuZamani;

        // Aynı danışmanın aynı saatte başka randevusu olmasın (±1 saat)
        $baslangic = $randevuZamani->copy()->subMinutes(59);
        $bitis = $randevuZamani->copy()->addMinutes(59);

        $cakisan = Appointment::where('agent_id', $veri['agent_id'])
            ->where('status', 'planlandi')
            ->whereBetween('scheduled_at', [$baslangic, $bitis])
            ->with('customer')
            ->first();

        if ($cakisan) {
            return response()->json([
                'message' => 'Danışmanın bu saatte başka randevusu var: '
                    . $cakisan->scheduled_at->format('d.m.Y H:i') . ' — '
                    . ($cakisan->customer ? $cakisan->customer->full_name : ''),
            ], 422);
        }

        $veri['status'] = 'planlandi';
        $randevu = Appointment::create($veri);

        return response()->json($randevu->load(['property', 'customer', 'agent']), 201);
    }

    // Randevu gerçekleşti — sonuç ve ilgi seviyesi girilir
    public function complete(Request $istek, Appointment $appointment)
    {
        if ($appointment->status !== 'planlandi') {
            return response()->json(['message' => 'Bu randevu zaten kapatılmış.'], 400);
        }

        $veri = $istek->validate([
            'interest_level' => 'required|in:dusuk,orta,yuksek',
            'result_note' => 'nullable|string',
        ], [
            'interest_level.required' => 'İlgi seviyesi seçilmelidir.',
        ]);

        $appointment->update([
            'status' => 'gerceklesti',
            'interest_level' => $veri['interest_level'],
            'result_note' => $veri['result_note'] ?? null,
        ]);

        return $appointment->load(['property', 'customer', 'agent']);
    }

    public function cancel(Request $istek, Appointment $appointment)
    {
        if ($appointment->status === 'gerceklesti') {
            return response()->json(['message' => 'Gerçekleşmiş randevu iptal edilemez.'], 400);
        }

        $appointment->update([
            'status' => 'iptal',
            'result_note' => $istek->input('result_note'),
        ]);

        return response()->json(['message' => 'Randevu iptal edildi.']);
    }
}
