// Demo verisi yukleme betigi.
// Calistirmadan once mevcut veriyi siler:  npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Property = require('../models/Property');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Reservation = require('../models/Reservation');
const Charge = require('../models/Charge');
const Payment = require('../models/Payment');
const Task = require('../models/Task');

const { gunBasi, bugun, gunEkle, geceSayisi } = require('../tarih');

// Otelde giris saati 14:00, cikis saati 11:00 kabul ediliyor
function saatli(tarih, saat) {
  const d = gunBasi(tarih);
  d.setHours(saat, 0, 0, 0);
  return d;
}

async function calistir() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('MongoDB bağlantısı kuruldu.');

  await Promise.all([
    User.deleteMany({}), Property.deleteMany({}), Room.deleteMany({}),
    Guest.deleteMany({}), Reservation.deleteMany({}), Charge.deleteMany({}),
    Payment.deleteMany({}), Task.deleteMany({}),
  ]);
  console.log('Eski veriler silindi.');

  const sifre = bcrypt.hashSync('123456', 10);

  const kullanicilar = await User.insertMany([
    { fullName: 'Emre Kılıç',     username: 'admin',      passwordHash: sifre, role: 'admin',      phone: '+90 532 100 20 30' },
    { fullName: 'Selin Aydın',    username: 'resepsiyon', passwordHash: sifre, role: 'resepsiyon', phone: '+90 533 200 30 40' },
    { fullName: 'Hatice Yıldız',  username: 'temizlik1',  passwordHash: sifre, role: 'temizlik',   phone: '+90 534 300 40 50' },
    { fullName: 'Ayşe Korkmaz',   username: 'temizlik2',  passwordHash: sifre, role: 'temizlik',   phone: '+90 535 400 50 60' },
    { fullName: 'Murat Şahin',    username: 'teknik1',    passwordHash: sifre, role: 'teknik',     phone: '+90 536 500 60 70' },
  ]);
  console.log(kullanicilar.length + ' kullanıcı eklendi.');

  const tesisler = await Property.insertMany([
    {
      name: 'Beşiktaş Suit Apart', type: 'apart',
      address: 'Sinanpaşa Mah. Ihlamurdere Cad. No:42',
      district: 'Beşiktaş', city: 'İstanbul', phone: '+90 212 260 10 10',
    },
    {
      name: 'Kadıköy Marina Otel', type: 'otel',
      address: 'Caferağa Mah. Rıhtım Cad. No:18',
      district: 'Kadıköy', city: 'İstanbul', phone: '+90 216 330 20 20',
    },
  ]);
  console.log(tesisler.length + ' tesis eklendi.');

  const odalar = [];

  // Apart: 1+1 ve 2+1 daireler
  const apartDaireler = [
    { number: 'A101', type: '1+1 Daire', capacity: 2, floor: 1, nightlyRate: 1850 },
    { number: 'A102', type: '1+1 Daire', capacity: 2, floor: 1, nightlyRate: 1850 },
    { number: 'A103', type: '2+1 Daire', capacity: 4, floor: 1, nightlyRate: 2600 },
    { number: 'A201', type: '1+1 Daire', capacity: 2, floor: 2, nightlyRate: 1950 },
    { number: 'A202', type: '2+1 Daire', capacity: 4, floor: 2, nightlyRate: 2700 },
    { number: 'A203', type: '2+1 Daire', capacity: 4, floor: 2, nightlyRate: 2700 },
    { number: 'A301', type: 'Teras Daire', capacity: 5, floor: 3, nightlyRate: 3400 },
    { number: 'A302', type: '1+1 Daire', capacity: 2, floor: 3, nightlyRate: 2050 },
  ];
  for (const d of apartDaireler) {
    odalar.push({ ...d, property: tesisler[0]._id, status: 'musait' });
  }

  // Otel odalari
  const otelOdalari = [
    { number: '101', type: 'Tek Kişilik',  capacity: 1, floor: 1, nightlyRate: 1400 },
    { number: '102', type: 'Çift Kişilik', capacity: 2, floor: 1, nightlyRate: 1900 },
    { number: '103', type: 'Çift Kişilik', capacity: 2, floor: 1, nightlyRate: 1900 },
    { number: '104', type: 'Aile Odası',   capacity: 4, floor: 1, nightlyRate: 2800 },
    { number: '201', type: 'Tek Kişilik',  capacity: 1, floor: 2, nightlyRate: 1500 },
    { number: '202', type: 'Çift Kişilik', capacity: 2, floor: 2, nightlyRate: 2000 },
    { number: '203', type: 'Çift Kişilik', capacity: 2, floor: 2, nightlyRate: 2000 },
    { number: '204', type: 'Deniz Manzaralı', capacity: 2, floor: 2, nightlyRate: 2650 },
    { number: '301', type: 'Deniz Manzaralı', capacity: 2, floor: 3, nightlyRate: 2750 },
    { number: '302', type: 'Aile Odası',   capacity: 4, floor: 3, nightlyRate: 2950 },
    { number: '401', type: 'Suit',         capacity: 3, floor: 4, nightlyRate: 4200 },
    { number: '402', type: 'Suit',         capacity: 3, floor: 4, nightlyRate: 4200 },
  ];
  for (const o of otelOdalari) {
    odalar.push({ ...o, property: tesisler[1]._id, status: 'musait' });
  }

  const kayitliOdalar = await Room.insertMany(odalar);
  console.log(kayitliOdalar.length + ' oda eklendi.');

  const misafirler = await Guest.insertMany([
    { fullName: 'Ahmet Yılmaz',    idNumber: '12345678901', phone: '+90 532 111 22 33', email: 'ahmet.yilmaz@ornek.com' },
    { fullName: 'Zeynep Kaya',     idNumber: '12345678902', phone: '+90 533 222 33 44', email: 'zeynep.kaya@ornek.com' },
    { fullName: 'Mustafa Demir',   idNumber: '12345678903', phone: '+90 534 333 44 55', email: 'm.demir@ornek.com' },
    { fullName: 'Elif Şahin',      idNumber: '12345678904', phone: '+90 535 444 55 66', email: 'elif.sahin@ornek.com' },
    { fullName: 'Hakan Öztürk',    idNumber: '12345678905', phone: '+90 536 555 66 77' },
    { fullName: 'Fatma Çelik',     idNumber: '12345678906', phone: '+90 537 666 77 88' },
    { fullName: 'Burak Arslan',    idNumber: '12345678907', phone: '+90 538 777 88 99' },
    { fullName: 'Merve Doğan',     idNumber: '12345678908', phone: '+90 539 888 99 00' },
    { fullName: 'Kemal Aksoy',     idNumber: '12345678909', phone: '+90 505 123 45 67' },
    { fullName: 'Deniz Polat',     idNumber: '12345678910', phone: '+90 506 234 56 78' },
    { fullName: 'Anna Schmidt',    phone: '+49 170 1234567', email: 'a.schmidt@ornek.de', country: 'Almanya' },
    { fullName: 'John Miller',     phone: '+44 7700 900123', email: 'j.miller@ornek.co.uk', country: 'İngiltere' },
  ]);
  console.log(misafirler.length + ' misafir eklendi.');

  // ---- Rezervasyonlar ----
  // Tarihler bugune gore hesaplaniyor ki demo her zaman guncel gorunsun.

  const gun0 = bugun();
  let sayac = 0;

  async function rezervasyonEkle(bilgi) {
    sayac++;
    const oda = bilgi.oda;
    const giris = gunEkle(gun0, bilgi.girisGun);
    const cikis = gunEkle(gun0, bilgi.cikisGun);
    const gece = geceSayisi(giris, cikis);

    const r = await Reservation.create({
      code: 'RZ-' + gun0.getFullYear() + '-' + String(sayac).padStart(5, '0'),
      room: oda._id,
      guest: bilgi.misafir._id,
      checkIn: giris,
      checkOut: cikis,
      nights: gece,
      adults: bilgi.yetiskin || 2,
      children: bilgi.cocuk || 0,
      nightlyRate: oda.nightlyRate,
      status: bilgi.durum,
      channel: bilgi.kanal || 'telefon',
      notes: bilgi.not,
      createdBy: kullanicilar[1]._id,
      checkedInAt:
        bilgi.durum === 'giris_yapildi' || bilgi.durum === 'cikis_yapildi'
          ? saatli(giris, 14) : undefined,
      checkedOutAt: bilgi.durum === 'cikis_yapildi' ? saatli(cikis, 11) : undefined,
    });

    // Konaklama masrafi
    await Charge.create({
      reservation: r._id,
      type: 'konaklama',
      description: `${gece} gece × ${oda.number} nolu oda`,
      quantity: gece,
      unitPrice: oda.nightlyRate,
      total: gece * oda.nightlyRate,
      date: giris,
    });

    // Ekstralar
    let ekstraToplam = 0;
    if (bilgi.ekstralar) {
      for (const e of bilgi.ekstralar) {
        await Charge.create({
          reservation: r._id,
          type: e.tip,
          description: e.aciklama,
          quantity: e.adet || 1,
          unitPrice: e.fiyat,
          total: (e.adet || 1) * e.fiyat,
          date: gunEkle(giris, 1),
        });
        ekstraToplam += (e.adet || 1) * e.fiyat;
      }
    }

    // Tahsilat
    if (bilgi.odemeOrani && bilgi.odemeOrani > 0) {
      const borc = gece * oda.nightlyRate + ekstraToplam;
      await Payment.create({
        reservation: r._id,
        amount: Math.round(borc * bilgi.odemeOrani),
        method: bilgi.odemeYontemi || 'kredi_karti',
        date: bilgi.durum === 'cikis_yapildi' ? saatli(cikis, 11) : saatli(giris, 14),
        takenBy: kullanicilar[1]._id,
      });
    }

    // Oda durumu
    if (bilgi.durum === 'giris_yapildi') {
      oda.status = 'dolu';
      await oda.save();
    }

    return r;
  }

  const A = kayitliOdalar; // kisa isim

  // Gecmis konaklamalar (cikis yapilmis)
  await rezervasyonEkle({ oda: A[0],  misafir: misafirler[0], girisGun: -9, cikisGun: -6, durum: 'cikis_yapildi', odemeOrani: 1,
    ekstralar: [{ tip: 'kahvalti', aciklama: 'Kahvaltı (3 gün × 2 kişi)', adet: 6, fiyat: 180 }] });
  await rezervasyonEkle({ oda: A[9],  misafir: misafirler[1], girisGun: -7, cikisGun: -4, durum: 'cikis_yapildi', odemeOrani: 1, odemeYontemi: 'nakit' });
  await rezervasyonEkle({ oda: A[12], misafir: misafirler[10], girisGun: -5, cikisGun: -1, durum: 'cikis_yapildi', odemeOrani: 1,
    kanal: 'internet', ekstralar: [{ tip: 'otopark', aciklama: 'Otopark (4 gece)', adet: 4, fiyat: 150 }] });

  // Su an iceride olanlar
  await rezervasyonEkle({ oda: A[2],  misafir: misafirler[2], girisGun: -2, cikisGun: 2, durum: 'giris_yapildi', odemeOrani: 0.5,
    yetiskin: 2, cocuk: 2, not: 'Bebek yatağı istendi.',
    ekstralar: [{ tip: 'kahvalti', aciklama: 'Kahvaltı (2 gün × 4 kişi)', adet: 8, fiyat: 180 }] });
  await rezervasyonEkle({ oda: A[10], misafir: misafirler[3], girisGun: -1, cikisGun: 3, durum: 'giris_yapildi', odemeOrani: 0.4 });
  // Bugun cikis yapacak — "Çıkış Yap" akisini denemek icin
  await rezervasyonEkle({ oda: A[18], misafir: misafirler[11], girisGun: -3, cikisGun: 0, durum: 'giris_yapildi', odemeOrani: 1,
    kanal: 'internet', ekstralar: [{ tip: 'minibar', aciklama: 'Minibar tüketimi', adet: 1, fiyat: 420 }] });
  await rezervasyonEkle({ oda: A[5],  misafir: misafirler[4], girisGun: 0, cikisGun: 4, durum: 'giris_yapildi', odemeOrani: 0.3, yetiskin: 3 });

  // Bugun giris bekleyenler
  await rezervasyonEkle({ oda: A[1],  misafir: misafirler[5], girisGun: 0, cikisGun: 3, durum: 'onaylandi', kanal: 'walkin' });
  await rezervasyonEkle({ oda: A[13], misafir: misafirler[6], girisGun: 0, cikisGun: 2, durum: 'onaylandi' });

  // Gelecek rezervasyonlar
  await rezervasyonEkle({ oda: A[3],  misafir: misafirler[7], girisGun: 2,  cikisGun: 6,  durum: 'onaylandi', kanal: 'internet' });
  await rezervasyonEkle({ oda: A[6],  misafir: misafirler[8], girisGun: 3,  cikisGun: 8,  durum: 'onaylandi', yetiskin: 4, cocuk: 1 });
  await rezervasyonEkle({ oda: A[14], misafir: misafirler[9], girisGun: 1,  cikisGun: 5,  durum: 'onaylandi' });
  await rezervasyonEkle({ oda: A[19], misafir: misafirler[0], girisGun: 5,  cikisGun: 9,  durum: 'onaylandi', kanal: 'internet' });
  await rezervasyonEkle({ oda: A[11], misafir: misafirler[1], girisGun: 4,  cikisGun: 7,  durum: 'onaylandi' });
  await rezervasyonEkle({ oda: A[16], misafir: misafirler[2], girisGun: 6,  cikisGun: 10, durum: 'onaylandi', yetiskin: 2 });

  console.log(sayac + ' rezervasyon eklendi.');

  // ---- Gorevler ----
  // Cikis yapan odalar icin bekleyen temizlik gorevleri
  const temizlikOdasi = A[12];   // 201 nolu oda — dun cikis yapildi
  temizlikOdasi.status = 'temizlik';
  await temizlikOdasi.save();

  await Task.create({
    room: temizlikOdasi._id,
    type: 'temizlik',
    status: 'bekliyor',
    priority: 'acil',
    description: 'Çıkış sonrası genel temizlik. Bugün yeni misafir gelecek.',
    source: 'cikis',
  });

  const bakimOdasi = A[7];       // A302 nolu daire — klima arizasi
  bakimOdasi.status = 'bakim';
  await bakimOdasi.save();

  await Task.create({
    room: bakimOdasi._id,
    type: 'bakim',
    status: 'bekliyor',
    priority: 'normal',
    description: 'Klima soğutmuyor, teknik ekip bakacak.',
    source: 'manuel',
    assignedTo: kullanicilar[4]._id,
  });

  await Task.create({
    room: A[4]._id,
    type: 'temizlik',
    status: 'basladi',
    priority: 'normal',
    description: 'Haftalık detaylı temizlik.',
    source: 'manuel',
    assignedTo: kullanicilar[2]._id,
    startedAt: new Date(),
  });

  await Task.create({
    room: A[15]._id,
    type: 'temizlik',
    status: 'tamamlandi',
    priority: 'normal',
    description: 'Çıkış sonrası temizlik.',
    source: 'cikis',
    assignedTo: kullanicilar[3]._id,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completionNote: 'Oda hazır, havlular yenilendi.',
  });

  console.log('4 görev eklendi.');
  console.log('\nDemo veriler yüklendi. Şifre hepsinde: 123456');

  await mongoose.disconnect();
}

calistir().catch((hata) => {
  console.error('Hata:', hata);
  process.exit(1);
});
