// Demo verisi yükleme betiği.  Çalıştırma:  npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { mongoose, baglan } = require('../db');

const Branch = require('../models/Branch');
const Merchant = require('../models/Merchant');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const ShipmentEvent = require('../models/ShipmentEvent');
const Manifest = require('../models/Manifest');
const CodCollection = require('../models/CodCollection');

const { ucretHesapla, otpUret } = require('../yardimcilar');

async function calistir() {
  await baglan();
  console.log('Eski veriler siliniyor...');

  await Promise.all([
    CodCollection.deleteMany({}),
    Manifest.deleteMany({}),
    ShipmentEvent.deleteMany({}),
    Shipment.deleteMany({}),
    User.deleteMany({}),
    Merchant.deleteMany({}),
    Branch.deleteMany({}),
  ]);

  const sifre = bcrypt.hashSync('123456', 10);

  // ---- Şubeler ----
  const subeler = await Branch.insertMany([
    {
      code: 'IST-KAD', name: 'Kadıköy Şube',
      districts: 'Kadıköy,Ataşehir,Maltepe,Ümraniye',
      address: 'Caferağa Mah. Moda Cad. No:12', phone: '+90 216 330 10 10',
    },
    {
      code: 'IST-BES', name: 'Beşiktaş Şube',
      districts: 'Beşiktaş,Şişli,Sarıyer,Kağıthane',
      address: 'Sinanpaşa Mah. Barbaros Bul. No:8', phone: '+90 212 260 20 20',
    },
    {
      code: 'IST-BAK', name: 'Bakırköy Şube',
      districts: 'Bakırköy,Bahçelievler,Zeytinburnu,Küçükçekmece',
      address: 'Ataköy 7. Kısım, Sahil Yolu No:5', phone: '+90 212 570 30 30',
    },
    {
      code: 'IST-BEY', name: 'Beylikdüzü Şube',
      districts: 'Beylikdüzü,Esenyurt,Avcılar,Büyükçekmece',
      address: 'Adnan Kahveci Mah. Yavuz Sultan Cad. No:21', phone: '+90 212 880 40 40',
    },
  ]);
  console.log(subeler.length + ' şube eklendi.');

  // ---- Tacirler ----
  const tacirVerisi = [
    ['TCR-001', 'Moda Butik Giyim', 'Selin Aydın', '+90 532 111 22 33', 'Kadıköy', 90, 12, 2],
    ['TCR-002', 'TeknoMarket Elektronik', 'Emre Kılıç', '+90 533 222 33 44', 'Şişli', 120, 15, 2.5],
    ['TCR-003', 'Anadolu Kitabevi', 'Ayşe Korkmaz', '+90 534 333 44 55', 'Beşiktaş', 75, 9, 1.5],
    ['TCR-004', 'Doğal Kozmetik', 'Murat Şahin', '+90 535 444 55 66', 'Bakırköy', 85, 11, 2],
    ['TCR-005', 'Ev Yaşam Mobilya', 'Hatice Yıldız', '+90 536 555 66 77', 'Beylikdüzü', 150, 20, 3],
  ];

  const tacirler = [];
  for (let i = 0; i < tacirVerisi.length; i++) {
    const t = tacirVerisi[i];
    tacirler.push(
      await Merchant.create({
        code: t[0], company_name: t[1], contact_name: t[2], phone: t[3], district: t[4],
        base_price: t[5], price_per_desi: t[6], cod_commission: t[7],
        address: t[4] + ' Mah. Sanayi Cad. No:' + (i + 10),
      })
    );
  }
  console.log(tacirler.length + ' tacir eklendi.');

  // ---- Kullanıcılar ----
  const kullaniciVerisi = [
    ['Ahmet Yılmaz',   'admin',     'admin',     '+90 532 900 10 10', subeler[0]._id, null, null],
    ['Zeynep Kaya',    'operasyon', 'operasyon', '+90 533 900 20 20', subeler[0]._id, null, null],
    ['Burak Demir',    'op2',       'operasyon', '+90 534 900 30 30', subeler[1]._id, null, null],
    ['Mustafa Öztürk', 'kurye1',    'kurye',     '+90 535 900 40 40', subeler[0]._id, null, '34 KRG 001'],
    ['Elif Çelik',     'kurye2',    'kurye',     '+90 536 900 50 50', subeler[1]._id, null, '34 KRG 002'],
    ['Hakan Arslan',   'kurye3',    'kurye',     '+90 537 900 60 60', subeler[2]._id, null, '34 KRG 003'],
    ['Selin Aydın',    'tacir1',    'tacir',     '+90 532 111 22 33', null, tacirler[0]._id, null],
    ['Emre Kılıç',     'tacir2',    'tacir',     '+90 533 222 33 44', null, tacirler[1]._id, null],
  ];

  const kullanicilar = [];
  for (const k of kullaniciVerisi) {
    kullanicilar.push(
      await User.create({
        full_name: k[0], username: k[1], password_hash: sifre, role: k[2],
        phone: k[3], branch_id: k[4], merchant_id: k[5], plate: k[6],
      })
    );
  }
  console.log(kullanicilar.length + ' kullanıcı eklendi.');

  const admin = kullanicilar[0];
  const kuryeler = kullanicilar.filter((k) => k.role === 'kurye');

  // Hangi ilçe hangi şubeye düşüyor
  function subeBul(ilce) {
    const aranan = ilce.trim().toLocaleLowerCase('tr');
    for (const s of subeler) {
      const liste = s.districts.split(',').map((d) => d.trim().toLocaleLowerCase('tr'));
      if (liste.includes(aranan)) return s;
    }
    return subeler[0];
  }

  // ---- Gönderiler ----
  const aliciVerisi = [
    ['Mehmet Şahin',   '+90 532 700 10 11', 'Caferağa Mah. Moda Cad. No:45 D:3', 'Kadıköy'],
    ['Fatma Arslan',   '+90 533 700 20 22', 'Barbaros Mah. Halk Sok. No:12 D:7', 'Ataşehir'],
    ['Ali Doğan',      '+90 534 700 30 33', 'Bağlarbaşı Mah. Sahil Yolu No:88', 'Maltepe'],
    ['Emine Koç',      '+90 535 700 40 44', 'Levent Mah. Çarşı Cad. No:5 D:2', 'Beşiktaş'],
    ['Kemal Yıldırım', '+90 536 700 50 55', 'Teşvikiye Mah. Valikonağı Cad. No:31', 'Şişli'],
    ['Sevgi Aksoy',    '+90 537 700 60 66', 'Ataköy 9. Kısım A Blok D:14', 'Bakırköy'],
    ['Onur Polat',     '+90 538 700 70 77', 'Siyavuşpaşa Mah. Bahar Sok. No:9', 'Bahçelievler'],
    ['Gizem Yalçın',   '+90 539 700 80 88', 'Adnan Kahveci Mah. Gül Sok. No:17', 'Beylikdüzü'],
    ['Tolga Erdem',    '+90 505 700 90 99', 'İnönü Mah. Namık Kemal Cad. No:3', 'Esenyurt'],
    ['Pınar Güneş',    '+90 506 701 10 12', 'Merkez Mah. Cumhuriyet Cad. No:56', 'Ümraniye'],
    ['Cem Aslan',      '+90 507 701 20 23', 'Nispetiye Mah. Ihlamur Sok. No:8', 'Beşiktaş'],
    ['Derya Tekin',    '+90 508 701 30 34', 'Zuhuratbaba Mah. İncirli Cad. No:41', 'Bakırköy'],
    ['Serkan Bulut',   '+90 530 701 40 45', 'Yenişehir Mah. Atatürk Cad. No:19', 'Avcılar'],
    ['Melis Kurt',     '+90 531 701 50 56', 'Kozyatağı Mah. Şaşkın Sok. No:6', 'Kadıköy'],
    ['Burcu Şen',      '+90 532 701 60 67', 'Sarıyer Merkez Mah. Deniz Cad. No:2', 'Sarıyer'],
    ['Ozan Kara',      '+90 533 701 70 78', 'Yeşilköy Mah. Havaalanı Cad. No:77', 'Bakırköy'],
    ['Nazlı Uçar',     '+90 534 701 80 89', 'Küçükyalı Mah. Bağdat Cad. No:120', 'Maltepe'],
    ['Volkan Kaplan',  '+90 535 701 90 90', 'Kağıthane Merkez Mah. Sadabad Cad. No:14', 'Kağıthane'],
    ['İrem Sarı',      '+90 536 702 10 11', 'Halkalı Merkez Mah. Atatürk Cad. No:88', 'Küçükçekmece'],
    ['Barış Yavuz',    '+90 537 702 20 22', 'Güzelyurt Mah. Fatih Cad. No:33', 'Esenyurt'],
    ['Aslı Toprak',    '+90 538 702 30 33', 'Fenerbahçe Mah. Bağdat Cad. No:210 D:5', 'Kadıköy'],
    ['Uğur Bilgin',    '+90 539 702 40 44', 'Etiler Mah. Nispetiye Cad. No:44', 'Beşiktaş'],
  ];

  const icerikler = [
    'Giyim', 'Elektronik aksesuar', 'Kitap', 'Kozmetik ürün',
    'Ev tekstili', 'Ayakkabı', 'Küçük ev aleti', 'Oyuncak',
  ];

  const gonderiler = [];
  const yil = new Date().getFullYear().toString().slice(2);

  for (let i = 0; i < aliciVerisi.length; i++) {
    const alici = aliciVerisi[i];
    const tacir = tacirler[i % tacirler.length];
    const varisSube = subeBul(alici[3]);
    const cikisSube = subeBul(tacir.district);

    const desi = [1, 2, 3, 5, 8][i % 5];
    const ucret = ucretHesapla(tacir, desi);
    // Her üçüncü gönderi kapıda ödemeli
    const kapida = i % 3 === 0 ? [450, 1250, 890, 320, 1750][i % 5] : 0;

    // Kayıt tarihini geriye doğru dağıtıyoruz ki grafikler dolu görünsün
    const kayitTarihi = new Date();
    kayitTarihi.setHours(kayitTarihi.getHours() - (aliciVerisi.length - i) * 6);

    const gonderi = await Shipment.create({
      barcode: 'KRG' + yil + (i + 1).toString().padStart(6, '0'),
      merchant_id: tacir._id,
      origin_branch_id: cikisSube._id,
      dest_branch_id: varisSube._id,
      receiver_name: alici[0],
      receiver_phone: alici[1],
      receiver_address: alici[2],
      receiver_district: alici[3],
      desi: desi,
      weight_kg: Number((desi * 0.8).toFixed(2)),
      content: icerikler[i % icerikler.length],
      payment_type: kapida > 0 ? 'alici_odemeli' : 'gonderici_odemeli',
      shipping_fee: ucret,
      cod_amount: kapida,
      status: 'olusturuldu',
      created_by: admin._id,
      created_at: kayitTarihi,
    });

    await ShipmentEvent.create({
      shipment_id: gonderi._id,
      status: 'olusturuldu',
      description: `Gönderi kaydı oluşturuldu. Dağıtım şubesi: ${varisSube.name}`,
      branch_id: cikisSube._id,
      user_id: admin._id,
      created_at: kayitTarihi,
    });

    gonderiler.push(gonderi);
  }
  console.log(gonderiler.length + ' gönderi eklendi.');

  // ---- Bazı gönderileri ilerlet ----
  // İlk 6 gönderi teslim edildi
  for (let i = 0; i < 6; i++) {
    const g = gonderiler[i];
    const kurye = kuryeler[i % kuryeler.length];

    const teslimZamani = new Date();
    teslimZamani.setHours(teslimZamani.getHours() - (6 - i) * 5);

    g.status = 'teslim_edildi';
    g.courier_id = kurye._id;
    g.delivered_at = teslimZamani;
    g.delivered_to = g.receiver_name;
    g.attempt_count = 1;
    g.signature = 'demo';
    g.delivery_note = 'Kapıda teslim alındı.';
    await g.save();

    await ShipmentEvent.insertMany([
      { shipment_id: g._id, status: 'subede', description: 'Şubeye kabul edildi.', branch_id: g.dest_branch_id, user_id: kurye._id },
      { shipment_id: g._id, status: 'dagitimda', description: 'Kuryeye zimmetlendi.', branch_id: g.dest_branch_id, user_id: kurye._id },
      {
        shipment_id: g._id, status: 'teslim_edildi',
        description: `${g.receiver_name} kişisine teslim edildi.` +
          (Number(g.cod_amount) > 0
            ? ` Kapıda ödeme tahsil edildi: ${Number(g.cod_amount).toFixed(2)} ₺.`
            : ''),
        branch_id: g.dest_branch_id, user_id: kurye._id,
      },
    ]);

    if (Number(g.cod_amount) > 0) {
      await CodCollection.create({
        shipment_id: g._id,
        amount: g.cod_amount,
        method: 'nakit',
        courier_id: kurye._id,
        collected_at: teslimZamani,
      });
    }
  }

  // Sonraki 5 gönderi dağıtımda (kuryeye zimmetli, OTP üretilmiş)
  for (let i = 6; i < 11; i++) {
    const g = gonderiler[i];
    const kurye = kuryeler[i % kuryeler.length];

    g.status = 'dagitimda';
    g.courier_id = kurye._id;
    g.otp_code = otpUret();
    g.otp_sent_at = new Date();
    g.attempt_count = 1;
    await g.save();

    await ShipmentEvent.insertMany([
      { shipment_id: g._id, status: 'subede', description: 'Şubeye kabul edildi.', branch_id: g.dest_branch_id, user_id: kurye._id },
      { shipment_id: g._id, status: 'dagitimda', description: 'Kuryeye zimmetlendi. Teslimat kodu alıcıya gönderildi.', branch_id: g.dest_branch_id, user_id: kurye._id },
    ]);
  }

  // Sonraki 5 gönderi şubede bekliyor
  for (let i = 11; i < 16; i++) {
    const g = gonderiler[i];
    g.status = 'subede';
    await g.save();
    await ShipmentEvent.create({
      shipment_id: g._id, status: 'subede',
      description: 'Şubeye kabul edildi.',
      branch_id: g.dest_branch_id, user_id: admin._id,
    });
  }

  // Bir gönderi teslim edilemedi
  const basarisiz = gonderiler[16];
  basarisiz.status = 'teslim_edilemedi';
  basarisiz.attempt_count = 2;
  basarisiz.delivery_note = 'Alıcı adreste bulunamadı.';
  await basarisiz.save();

  await ShipmentEvent.insertMany([
    { shipment_id: basarisiz._id, status: 'subede', description: 'Şubeye kabul edildi.', branch_id: basarisiz.dest_branch_id, user_id: kuryeler[0]._id },
    { shipment_id: basarisiz._id, status: 'dagitimda', description: 'Kuryeye zimmetlendi.', branch_id: basarisiz.dest_branch_id, user_id: kuryeler[0]._id },
    { shipment_id: basarisiz._id, status: 'teslim_edilemedi', description: 'Teslim edilemedi (2. deneme). Sebep: Alıcı adreste bulunamadı.', branch_id: basarisiz.dest_branch_id, user_id: kuryeler[0]._id },
  ]);

  console.log('Gönderi durumları ayarlandı.');
  console.log('');
  console.log('Demo veriler yüklendi. Şifre hepsinde: 123456');

  await mongoose.disconnect();
}

calistir().catch((hata) => {
  console.error('Hata:', hata);
  process.exit(1);
});
