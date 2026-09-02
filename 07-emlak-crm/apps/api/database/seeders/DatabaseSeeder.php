<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Contract;
use App\Models\Customer;
use App\Models\Demand;
use App\Models\Installment;
use App\Models\Owner;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Önce eski demo verisini temizliyoruz
        DB::statement('TRUNCATE documents, installments, contracts, appointments,
                       demands, customers, properties, owners,
                       personal_access_tokens, users RESTART IDENTITY CASCADE');

        $sifre = Hash::make('123456');

        $admin = User::create([
            'name' => 'Serkan Aydın', 'email' => 'admin@emlak.com',
            'password' => $sifre, 'role' => 'admin', 'phone' => '+90 532 100 10 10',
        ]);
        $elif = User::create([
            'name' => 'Elif Yılmaz', 'email' => 'elif@emlak.com',
            'password' => $sifre, 'role' => 'danisman', 'phone' => '+90 533 200 20 20',
        ]);
        $burak = User::create([
            'name' => 'Burak Kaya', 'email' => 'burak@emlak.com',
            'password' => $sifre, 'role' => 'danisman', 'phone' => '+90 534 300 30 30',
        ]);
        $zeynep = User::create([
            'name' => 'Zeynep Demir', 'email' => 'zeynep@emlak.com',
            'password' => $sifre, 'role' => 'danisman', 'phone' => '+90 535 400 40 40',
        ]);
        $danismanlar = [$elif, $burak, $zeynep];

        $this->command->info('4 kullanıcı eklendi.');

        // ---- Mal sahipleri ----
        $sahipVerisi = [
            ['Mehmet Şahin', '+90 532 111 22 33', 'TR12 0001 0000 1111 2222 3333 44'],
            ['Ayşe Öztürk', '+90 533 222 33 44', 'TR12 0001 0000 2222 3333 4444 55'],
            ['Hasan Çelik', '+90 534 333 44 55', null],
            ['Fatma Arslan', '+90 535 444 55 66', 'TR12 0001 0000 3333 4444 5555 66'],
            ['Ali Doğan', '+90 536 555 66 77', null],
            ['Emine Koç', '+90 537 666 77 88', 'TR12 0001 0000 4444 5555 6666 77'],
            ['Kemal Yıldırım', '+90 538 777 88 99', null],
            ['Sevgi Aksoy', '+90 539 888 99 00', 'TR12 0001 0000 5555 6666 7777 88'],
        ];

        $sahipler = [];
        foreach ($sahipVerisi as $i => $s) {
            $sahipler[] = Owner::create([
                'full_name' => $s[0],
                'phone' => $s[1],
                'email' => null,
                'id_number' => '1234567890' . $i,
                'iban' => $s[2],
            ]);
        }
        $this->command->info(count($sahipler) . ' mal sahibi eklendi.');

        // ---- Portföy ----
        $portfoyVerisi = [
            // [başlık, işlem, tip, ilçe, mahalle, oda, m2, kat, yaş, fiyat, aidat, otopark, asansör, eşyalı]
            ['Moda\'da Denize Yakın Ferah 2+1', 'kiralik', 'daire', 'Kadıköy', 'Moda', '2+1', 95, 3, 12, 32000, 1200, false, true, true],
            ['Caferağa\'da Yenilenmiş 1+1', 'kiralik', 'daire', 'Kadıköy', 'Caferağa', '1+1', 65, 2, 25, 24000, 900, false, false, true],
            ['Fenerbahçe Parkı Yanı 3+1', 'satilik', 'daire', 'Kadıköy', 'Fenerbahçe', '3+1', 140, 5, 8, 12500000, 2200, true, true, false],
            ['Göztepe\'de Bahçe Katı 3+1', 'satilik', 'daire', 'Kadıköy', 'Göztepe', '3+1', 130, 0, 18, 8900000, 1500, true, true, false],
            ['Levent\'te Metroya 3 Dakika 2+1', 'kiralik', 'daire', 'Beşiktaş', 'Levent', '2+1', 100, 7, 6, 45000, 2500, true, true, true],
            ['Etiler\'de Havuzlu Sitede 4+1', 'satilik', 'daire', 'Beşiktaş', 'Etiler', '4+1', 210, 4, 10, 24500000, 4500, true, true, false],
            ['Ortaköy Boğaz Manzaralı 2+1', 'kiralik', 'daire', 'Beşiktaş', 'Ortaköy', '2+1', 110, 6, 15, 55000, 2000, true, true, true],
            ['Nişantaşı\'nda Cadde Üstü Dükkan', 'kiralik', 'isyeri', 'Şişli', 'Teşvikiye', null, 75, 0, 30, 68000, 0, false, false, false],
            ['Mecidiyeköy\'de Plaza Ofisi', 'kiralik', 'isyeri', 'Şişli', 'Mecidiyeköy', null, 180, 12, 9, 95000, 6000, true, true, false],
            ['Fulya\'da Yatırımlık 1+1', 'satilik', 'daire', 'Şişli', 'Fulya', '1+1', 60, 3, 5, 6200000, 1100, false, true, false],
            ['Ataşehir Batı\'da Site İçi 3+1', 'kiralik', 'daire', 'Ataşehir', 'Barbaros', '3+1', 145, 9, 7, 42000, 3000, true, true, false],
            ['Finans Merkezi Yakını 2+1', 'satilik', 'daire', 'Ataşehir', 'Küçükbakkalköy', '2+1', 105, 11, 4, 9800000, 2400, true, true, false],
            ['Çengelköy\'de Bahçeli Müstakil Villa', 'satilik', 'villa', 'Üsküdar', 'Çengelköy', '5+2', 320, 0, 14, 32000000, 0, true, false, false],
            ['Kuzguncuk\'ta Tarihi Bina Dairesi 2+1', 'kiralik', 'daire', 'Üsküdar', 'Kuzguncuk', '2+1', 85, 1, 45, 28000, 600, false, false, true],
            ['Bakırköy Sahil Yolu 3+1', 'satilik', 'daire', 'Bakırköy', 'Ataköy', '3+1', 155, 8, 11, 11200000, 2800, true, true, false],
            ['Ataköy\'de Kiralık Eşyalı 1+1', 'kiralik', 'daire', 'Bakırköy', 'Ataköy', '1+1', 70, 4, 11, 27000, 1400, true, true, true],
            ['Maltepe Sahilde Manzaralı 2+1', 'kiralik', 'daire', 'Maltepe', 'Bağlarbaşı', '2+1', 98, 10, 3, 30000, 1800, true, true, false],
            ['Maltepe\'de Yeni Bina 4+1', 'satilik', 'daire', 'Maltepe', 'Cevizli', '4+1', 190, 6, 2, 14500000, 3200, true, true, false],
            ['Beylikdüzü\'nde Geniş 3+1', 'satilik', 'daire', 'Beylikdüzü', 'Gürpınar', '3+1', 160, 5, 6, 5900000, 1600, true, true, false],
            ['Beylikdüzü Merkezde Kiralık 2+1', 'kiralik', 'daire', 'Beylikdüzü', 'Adnan Kahveci', '2+1', 110, 3, 8, 21000, 1300, true, true, false],
            ['Sarıyer\'de Orman Manzaralı Villa', 'satilik', 'villa', 'Sarıyer', 'Zekeriyaköy', '6+2', 420, 0, 9, 48000000, 5000, true, false, false],
            ['Şile Yolu Üzeri Yatırımlık Arsa', 'satilik', 'arsa', 'Şile', 'Ağva', null, 1200, null, null, 4200000, 0, false, false, false],
            ['Kadıköy Bahariye\'de Depolu Dükkan', 'kiralik', 'isyeri', 'Kadıköy', 'Bahariye', null, 90, 0, 35, 52000, 0, false, false, false],
            ['Üsküdar Merkez Kiralık 1+1', 'kiralik', 'daire', 'Üsküdar', 'Mimar Sinan', '1+1', 58, 2, 22, 19000, 700, false, false, false],
        ];

        $isitmalar = ['Doğalgaz (Kombi)', 'Merkezi', 'Yerden Isıtma', 'Klima'];
        $portfoyler = [];

        foreach ($portfoyVerisi as $i => $p) {
            $portfoyler[] = Property::create([
                'code' => 'PRT-' . date('Y') . '-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                'title' => $p[0],
                'listing_type' => $p[1],
                'property_type' => $p[2],
                'city' => 'İstanbul',
                'district' => $p[3],
                'neighborhood' => $p[4],
                'address' => $p[4] . ' Mah. ' . (($i % 9) + 1) . '. Sokak No:' . (($i % 40) + 1),
                'room_count' => $p[5],
                'gross_area' => $p[6],
                'floor' => $p[7],
                'building_age' => $p[8],
                'heating' => $p[2] === 'arsa' ? null : $isitmalar[$i % 4],
                'is_furnished' => $p[13],
                'has_elevator' => $p[12],
                'has_parking' => $p[11],
                'price' => $p[9],
                'dues' => $p[10],
                'status' => 'aktif',
                'description' => $p[0] . '. Detaylı bilgi için danışmanımızla iletişime geçebilirsiniz.',
                'owner_id' => $sahipler[$i % count($sahipler)]->id,
                'agent_id' => $danismanlar[$i % 3]->id,
            ]);
        }
        $this->command->info(count($portfoyler) . ' portföy eklendi.');

        // ---- Müşteriler ----
        $musteriVerisi = [
            ['Ahmet Yılmaz', '+90 532 900 10 11', 'telefon'],
            ['Selin Kaya', '+90 533 900 20 22', 'web'],
            ['Murat Demir', '+90 534 900 30 33', 'tabela'],
            ['Deniz Şahin', '+90 535 900 40 44', 'tavsiye'],
            ['Gizem Öztürk', '+90 536 900 50 55', 'web'],
            ['Onur Çelik', '+90 537 900 60 66', 'telefon'],
            ['Pınar Arslan', '+90 538 900 70 77', 'web'],
            ['Cem Doğan', '+90 539 900 80 88', 'tavsiye'],
            ['Ebru Koç', '+90 505 900 90 99', 'telefon'],
            ['Tolga Yıldırım', '+90 506 901 10 12', 'tabela'],
            ['Nihan Aksoy', '+90 507 901 20 23', 'web'],
            ['Emre Polat', '+90 508 901 30 34', 'telefon'],
        ];

        $musteriler = [];
        foreach ($musteriVerisi as $i => $m) {
            $musteriler[] = Customer::create([
                'full_name' => $m[0],
                'phone' => $m[1],
                'email' => null,
                'id_number' => '9876543210' . $i,
                'source' => $m[2],
                'agent_id' => $danismanlar[$i % 3]->id,
            ]);
        }
        $this->command->info(count($musteriler) . ' müşteri eklendi.');

        // ---- Talepler ----
        $talepVerisi = [
            [0, 'kiralik', 'daire', 'Kadıköy', 20000, 35000, 80, '2+1', false],
            [1, 'satilik', 'daire', 'Ataşehir', null, 10000000, 90, '2+1', true],
            [2, 'kiralik', 'isyeri', 'Şişli', null, 100000, null, null, false],
            [3, 'satilik', 'villa', null, null, 40000000, 250, null, true],
            [4, 'kiralik', 'daire', 'Beşiktaş', null, 60000, 90, '2+1', false],
            [5, 'satilik', 'daire', 'Bakırköy', null, 12000000, 140, '3+1', true],
            [6, 'kiralik', 'daire', 'Beylikdüzü', null, 25000, 100, '2+1', false],
            [7, 'satilik', 'daire', null, 5000000, 9000000, null, '3+1', false],
        ];

        foreach ($talepVerisi as $t) {
            Demand::create([
                'customer_id' => $musteriler[$t[0]]->id,
                'listing_type' => $t[1],
                'property_type' => $t[2],
                'district' => $t[3],
                'min_price' => $t[4],
                'max_price' => $t[5],
                'min_area' => $t[6],
                'min_room_count' => $t[7],
                'needs_parking' => $t[8],
                'status' => 'aktif',
                'notes' => 'Müşteri en geç 2 ay içinde taşınmak istiyor.',
            ]);
        }
        $this->command->info(count($talepVerisi) . ' talep eklendi.');

        // ---- Randevular ----
        // [portföy, müşteri, danışman, gün farkı, saat, durum, ilgi]
        $randevuVerisi = [
            [0, 0, 0, -6, '14:00', 'gerceklesti', 'yuksek', 'Müşteri çok beğendi, fiyat pazarlığı yapmak istiyor.'],
            [3, 1, 1, -5, '11:00', 'gerceklesti', 'orta', 'Konum iyi ama bina yaşı yüksek geldi.'],
            [7, 2, 2, -4, '16:30', 'gerceklesti', 'dusuk', 'Metrekare beklentisini karşılamadı.'],
            [12, 3, 0, -3, '10:00', 'gerceklesti', 'yuksek', 'Villa çok beğenildi, ikinci görüşme planlanacak.'],
            [4, 4, 1, -2, '13:00', 'iptal', null, 'Müşteri son anda iptal etti.'],
            [14, 5, 2, -1, '15:00', 'gerceklesti', 'orta', 'Aidat yüksek bulundu.'],
            [1, 0, 0, 0, '11:00', 'planlandi', null, null],
            [10, 6, 1, 0, '14:30', 'planlandi', null, null],
            [17, 7, 2, 0, '17:00', 'planlandi', null, null],
            [6, 4, 1, 1, '12:00', 'planlandi', null, null],
            [19, 6, 0, 1, '15:30', 'planlandi', null, null],
            [15, 8, 2, 2, '10:30', 'planlandi', null, null],
            [2, 9, 0, 3, '14:00', 'planlandi', null, null],
            [20, 3, 1, 4, '11:30', 'planlandi', null, null],
            [16, 10, 2, 5, '16:00', 'planlandi', null, null],
        ];

        foreach ($randevuVerisi as $r) {
            Appointment::create([
                'property_id' => $portfoyler[$r[0]]->id,
                'customer_id' => $musteriler[$r[1]]->id,
                'agent_id' => $danismanlar[$r[2]]->id,
                'scheduled_at' => now()->addDays($r[3])->setTimeFromTimeString($r[4]),
                'status' => $r[5],
                'interest_level' => $r[6],
                'result_note' => $r[7],
            ]);
        }
        $this->command->info(count($randevuVerisi) . ' randevu eklendi.');

        // ---- Sözleşmeler ve taksitler ----
        // Kira sözleşmeleri: [portföy, müşteri, danışman, kaç ay önce başladı, süre, komisyon %]
        $kiraSozlesmeleri = [
            [13, 0, 0, 4, 12, 100],   // Kuzguncuk 2+1
            [23, 1, 1, 2, 12, 100],   // Üsküdar 1+1
            [16, 2, 2, 1, 24, 100],   // Maltepe 2+1
            [22, 3, 0, 0, 36, 100],   // Bahariye dükkan
        ];

        // Her sozlesmenin odeme gunu farkli — gercek hayatta da oyle
        $odemeGunleri = [1, 5, 10, 15];
        $sayac = 0;
        foreach ($kiraSozlesmeleri as $k) {
            $sayac++;
            $odemeGunu = $odemeGunleri[($sayac - 1) % 4];
            $portfoy = $portfoyler[$k[0]];
            $baslangic = now()->startOfMonth()->subMonths($k[3]);
            $sure = $k[4];
            $kira = (float) $portfoy->price;

            $sozlesme = Contract::create([
                'code' => 'SZL-' . date('Y') . '-' . str_pad($sayac, 5, '0', STR_PAD_LEFT),
                'type' => 'kira',
                'property_id' => $portfoy->id,
                'customer_id' => $musteriler[$k[1]]->id,
                'owner_id' => $portfoy->owner_id,
                'agent_id' => $danismanlar[$k[2]]->id,
                'start_date' => $baslangic->toDateString(),
                'end_date' => $baslangic->copy()->addMonths($sure)->subDay()->toDateString(),
                'amount' => $kira,
                'deposit' => $kira * 2,
                'payment_day' => $odemeGunu,
                'duration_months' => $sure,
                'commission_rate' => $k[5],
                'commission_amount' => $kira * $k[5] / 100,
                'status' => 'aktif',
            ]);

            // Sozlesme gercekte baslangic tarihinde acilmisti
            $sozlesme->forceFill(['created_at' => $baslangic])->save();

            $portfoy->update(['status' => 'kiralandi']);

            for ($i = 0; $i < $sure; $i++) {
                $ayBasi = $baslangic->copy()->addMonths($i);
                $vade = $ayBasi->copy()->day($odemeGunu);

                // Geçmiş aylar ödendi; sadece en son vadesi geçen biri gecikmiş bırakıldı
                $gecmis = $vade->isPast();
                $sonGecmisMi = $gecmis && $vade->diffInDays(now()) < 35;

                $odendi = $gecmis && !($sonGecmisMi && $sayac % 2 === 0);

                Installment::create([
                    'contract_id' => $sozlesme->id,
                    'period' => $ayBasi->format('Y-m'),
                    'sequence' => $i + 1,
                    'due_date' => $vade->toDateString(),
                    'amount' => $kira,
                    'paid_amount' => $odendi ? $kira : 0,
                    'paid_at' => $odendi ? $vade->toDateString() : null,
                    'payment_method' => $odendi ? 'havale' : null,
                    'status' => $odendi ? 'odendi' : ($gecmis ? 'gecikti' : 'bekliyor'),
                ]);
            }
        }

        // Satış sözleşmeleri
        $satisSozlesmeleri = [
            [3, 4, 1, 2, 2],    // Göztepe 3+1
            [18, 5, 2, 0, 2],   // Beylikdüzü 3+1
        ];

        foreach ($satisSozlesmeleri as $s) {
            $sayac++;
            $portfoy = $portfoyler[$s[0]];
            $bedel = (float) $portfoy->price;

            $satis = Contract::create([
                'code' => 'SZL-' . date('Y') . '-' . str_pad($sayac, 5, '0', STR_PAD_LEFT),
                'type' => 'satis',
                'property_id' => $portfoy->id,
                'customer_id' => $musteriler[$s[1]]->id,
                'owner_id' => $portfoy->owner_id,
                'agent_id' => $danismanlar[$s[2]]->id,
                'start_date' => now()->subMonths($s[3])->toDateString(),
                'amount' => $bedel,
                'commission_rate' => $s[4],
                'commission_amount' => $bedel * $s[4] / 100,
                'status' => 'aktif',
            ]);

            $satis->forceFill(['created_at' => now()->subMonths($s[3])])->save();

            $portfoy->update(['status' => 'satildi']);
        }

        $this->command->info($sayac . ' sözleşme eklendi.');
        $this->command->info('');
        $this->command->info('Demo veriler yüklendi. Şifre hepsinde: 123456');
    }
}
