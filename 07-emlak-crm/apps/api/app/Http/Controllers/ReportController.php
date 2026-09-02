<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Contract;
use App\Models\Customer;
use App\Models\Demand;
use App\Models\Installment;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function summary()
    {
        $bugun = now()->toDateString();
        $ayBasi = now()->startOfMonth()->toDateString();

        $aktifPortfoy = Property::where('status', 'aktif')->count();
        $satilik = Property::where('status', 'aktif')->where('listing_type', 'satilik')->count();
        $kiralik = Property::where('status', 'aktif')->where('listing_type', 'kiralik')->count();

        $bugunRandevu = Appointment::whereDate('scheduled_at', $bugun)
            ->where('status', 'planlandi')->count();

        $aktifTalep = Demand::where('status', 'aktif')->count();
        $aktifSozlesme = Contract::where('status', 'aktif')->count();

        // Bu ay tahsil edilen kira
        $ayTahsilat = (float) Installment::where('status', 'odendi')
            ->whereDate('paid_at', '>=', $ayBasi)
            ->sum('paid_amount');

        // Geciken taksitler
        $gecikenSorgu = Installment::whereIn('status', ['bekliyor', 'gecikti'])
            ->whereDate('due_date', '<', $bugun);
        $gecikenAdet = (clone $gecikenSorgu)->count();
        $gecikenTutar = (float) (clone $gecikenSorgu)->sum(DB::raw('amount - paid_amount'));

        // Bu ay kesilen komisyon
        $ayKomisyon = (float) Contract::whereDate('created_at', '>=', $ayBasi)
            ->sum('commission_amount');

        return response()->json([
            'active_properties' => $aktifPortfoy,
            'for_sale' => $satilik,
            'for_rent' => $kiralik,
            'today_appointments' => $bugunRandevu,
            'active_demands' => $aktifTalep,
            'active_contracts' => $aktifSozlesme,
            'customers' => Customer::count(),
            'month_collected' => $ayTahsilat,
            'overdue_count' => $gecikenAdet,
            'overdue_amount' => $gecikenTutar,
            'month_commission' => $ayKomisyon,
        ]);
    }

    // Danışman performansı
    public function agents()
    {
        $ayBasi = now()->startOfMonth()->toDateString();
        $sonuc = [];

        foreach (User::where('is_active', true)->orderBy('name')->get() as $danisman) {
            $sonuc[] = [
                'id' => $danisman->id,
                'name' => $danisman->name,
                'role' => $danisman->role,
                'properties' => Property::where('agent_id', $danisman->id)->count(),
                'active_properties' => Property::where('agent_id', $danisman->id)
                    ->where('status', 'aktif')->count(),
                'customers' => Customer::where('agent_id', $danisman->id)->count(),
                'appointments_month' => Appointment::where('agent_id', $danisman->id)
                    ->whereDate('scheduled_at', '>=', $ayBasi)->count(),
                'contracts_month' => Contract::where('agent_id', $danisman->id)
                    ->whereDate('created_at', '>=', $ayBasi)->count(),
                'commission_month' => (float) Contract::where('agent_id', $danisman->id)
                    ->whereDate('created_at', '>=', $ayBasi)->sum('commission_amount'),
            ];
        }

        return response()->json($sonuc);
    }

    // Son 6 ayın kira tahsilatı
    public function collections()
    {
        $aylar = [];

        for ($i = 5; $i >= 0; $i--) {
            $ay = now()->startOfMonth()->subMonths($i);
            $donem = $ay->format('Y-m');

            $taksitler = Installment::where('period', $donem)
                ->where('status', '!=', 'iptal')
                ->get();

            $aylar[] = [
                'period' => $donem,
                'label' => $this->ayAdi($ay->month) . ' ' . $ay->year,
                'expected' => (float) $taksitler->sum('amount'),
                'collected' => (float) $taksitler->sum('paid_amount'),
                'count' => $taksitler->count(),
            ];
        }

        return response()->json($aylar);
    }

    // Portföy dağılımı — ilçe ve tipe göre
    public function portfolio()
    {
        $ilceler = Property::select('district', DB::raw('count(*) as adet'))
            ->where('status', 'aktif')
            ->groupBy('district')
            ->orderByDesc('adet')
            ->get();

        $tipler = Property::select('property_type', DB::raw('count(*) as adet'))
            ->where('status', 'aktif')
            ->groupBy('property_type')
            ->orderByDesc('adet')
            ->get();

        return response()->json([
            'by_district' => $ilceler,
            'by_type' => $tipler,
        ]);
    }

    private function ayAdi(int $ay): string
    {
        $adlar = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return $adlar[$ay] ?? '';
    }
}
