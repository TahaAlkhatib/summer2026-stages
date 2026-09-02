// Demo verisi yükleme betiği.  Çalıştırma:  npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { havuz, sorgu, tek } = require('../db');
const { ucretHesapla, otpUret } = require('../yardimcilar');

async function calistir() {
  console.log('Eski veriler siliniyor...');
  await sorgu(`TRUNCATE cod_collections, manifest_items, manifests, shipment_events,
               shipments, users, merchants, branches RESTART IDENTITY CASCADE`);

  const sifre = bcrypt.hashSync('123456', 10);

  // ---- Şubeler ----
  const subeVerisi = [
    ['IST-KAD', 'Kadıköy Şube', 'Kadıköy,Ataşehir,Maltepe,Ümraniye',
      'Caferağa Mah. Moda Cad. No:12', '+90 216 330 10 10'],
    ['IST-BES', 'Beşiktaş Şube', 'Beşiktaş,Şişli,Sarıyer,Kağıthane',
      'Sinanpaşa Mah. Barbaros Bul. No:8', '+90 212 260 20 20'],
    ['IST-BAK', 'Bakırköy Şube', 'Bakırköy,Bahçelievler,Zeytinburnu,Küçükçekmece',
      'Ataköy 7. Kısım, Sahil Yolu No:5', '+90 212 570 30 30'],
    ['IST-BEY', 'Beylikdüzü Şube', 'Beylikdüzü,Esenyurt,Avcılar,Büyükçekmece',
      'Adnan Kahveci Mah. Yavuz Sultan Cad. No:21', '+90 212 880 40 40'],
  ];

  const subeler = [];
  for (const s of subeVerisi) {
    subeler.push(await tek(
      `INSERT INTO branches (code, name, districts, address, phone)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      s
    ));
  }
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
  for (const t of tacirVerisi) {
    tacirler.push(await tek(
      `INSERT INTO merchants (code, company_name, contact_name, phone, district,
                              base_price, price_per_desi, cod_commission, address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [...t, t[4] + ' Mah. Sanayi Cad. No:' + (tacirler.length + 10)]
    ));
  }
  console.log(tacirler.length + ' tacir eklendi.');

  // ---- Kullanıcılar ----
  const kullaniciVerisi = [
    ['Ahmet Yılmaz',  'admin',     'admin',     '+90 532 900 10 10', subeler[0].id, null, null],
    ['Zeynep Kaya',   'operasyon', 'operasyon', '+90 533 900 20 20', subeler[0].id, null, null],
    ['Burak Demir',   'op2',       'operasyon', '+90 534 900 30 30', subeler[1].id, null, null],
    ['Mustafa Öztürk','kurye1',    'kurye',     '+90 535 900 40 40', subeler[0].id, null, '34 KRG 001'],
    ['Elif Çelik',    'kurye2',    'kurye',     '+90 536 900 50 50', subeler[1].id, null, '34 KRG 002'],
    ['Hakan Arslan',  'kurye3',    'kurye',     '+90 537 900 60 60', subeler[2].id, null, '34 KRG 003'],
    ['Selin Aydın',   'tacir1',    'tacir',     '+90 532 111 22 33', null, tacirler[0].id, null],
    ['Emre Kılıç',    'tacir2',    'tacir',     '+90 533 222 33 44', null, tacirler[1].id, null],
  ];

  const kullanicilar = [];
  for (const k of kullaniciVerisi) {
    kullanicilar.push(await tek(
      `INSERT INTO users (full_name, username, password_hash, role, phone,
                          branch_id, merchant_id, plate)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [k[0], k[1], sifre, k[2], k[3], k[4], k[5], k[6]]
    ));
  }
  console.log(kullanicilar.length + ' kullanıcı eklendi.');

  const admin = kullanicilar[0];
  const kuryeler = kullanicilar.filter((k) => k.role === 'kurye');

  // ---- Gönderiler ----
  const aliciVerisi = [
    ['Mehmet Şahin',     '+90 532 700 10 11', 'Caferağa Mah. Moda Cad. No:45 D:3', 'Kadıköy'],
    ['Fatma Arslan',     '+90 533 700 20 22', 'Barbaros Mah. Halk Sok. No:12 D:7', 'Ataşehir'],
    ['Ali Doğan',        '+90 534 700 30 33', 'Bağlarbaşı Mah. Sahil Yolu No:88', 'Maltepe'],
    ['Emine Koç',        '+90 535 700 40 44', 'Levent Mah. Çarşı Cad. No:5 D:2', 'Beşiktaş'],
    ['Kemal Yıldırım',   '+90 536 700 50 55', 'Teşvikiye Mah. Valikonağı Cad. No:31', 'Şişli'],
    ['Sevgi Aksoy',      '+90 537 700 60 66', 'Ataköy 9. Kısım A Blok D:14', 'Bakırköy'],
    ['Onur Polat',       '+90 538 700 70 77', 'Siyavuşpaşa Mah. Bahar Sok. No:9', 'Bahçelievler'],
    ['Gizem Yalçın',     '+90 539 700 80 88', 'Adnan Kahveci Mah. Gül Sok. No:17', 'Beylikdüzü'],
    ['Tolga Erdem',      '+90 505 700 90 99', 'İnönü Mah. Namık Kemal Cad. No:3', 'Esenyurt'],
    ['Pınar Güneş',      '+90 506 701 10 12', 'Merkez Mah. Cumhuriyet Cad. No:56', 'Ümraniye'],
    ['Cem Aslan',        '+90 507 701 20 23', 'Nispetiye Mah. Ihlamur Sok. No:8', 'Beşiktaş'],
    ['Derya Tekin',      '+90 508 701 30 34', 'Zuhuratbaba Mah. İncirli Cad. No:41', 'Bakırköy'],
    ['Serkan Bulut',     '+90 530 701 40 45', 'Yenişehir Mah. Atatürk Cad. No:19', 'Avcılar'],
    ['Melis Kurt',       '+90 531 701 50 56', 'Kozyatağı Mah. Şaşkın Sok. No:6', 'Kadıköy'],
    ['Burcu Şen',        '+90 532 701 60 67', 'Sarıyer Merkez Mah. Deniz Cad. No:2', 'Sarıyer'],
    ['Ozan Kara',        '+90 533 701 70 78', 'Yeşilköy Mah. Havaalanı Cad. No:77', 'Bakırköy'],
    ['Nazlı Uçar',       '+90 534 701 80 89', 'Küçükyalı Mah. Bağdat Cad. No:120', 'Maltepe'],
    ['Volkan Kaplan',    '+90 535 701 90 90', 'Kağıthane Merkez Mah. Sadabad Cad. No:14', 'Kağıthane'],
    ['İrem Sarı',        '+90 536 702 10 11', 'Halkalı Merkez Mah. Atatürk Cad. No:88', 'Küçükçekmece'],
    ['Barış Yavuz',      '+90 537 702 20 22', 'Güzelyurt Mah. Fatih Cad. No:33', 'Esenyurt'],
    ['Aslı Toprak',      '+90 538 702 30 33', 'Fenerbahçe Mah. Bağdat Cad. No:210 D:5', 'Kadıköy'],
    ['Uğur Bilgin',      '+90 539 702 40 44', 'Etiler Mah. Nispetiye Cad. No:44', 'Beşiktaş'],
  ];

  const icerikler = [
    'Giyim', 'Elektronik aksesuar', 'Kitap', 'Kozmetik ürün',
    'Ev tekstili', 'Ayakkabı', 'Küçük ev aleti', 'Oyuncak',
  ];

  // Hangi ilçe hangi şubeye düşüyor
  async function subeBul(ilce) {
    const aranan = ilce.trim().toLocaleLowerCase('tr');
    for (const s of subeler) {
      const liste = s.districts.split(',').map((d) => d.trim().toLocaleLowerCase('tr'));
      if (liste.includes(aranan)) return s;
    }
    return subeler[0];
  }

  const gonderiler = [];
  const yil = new Date().getFullYear().toString().slice(2);

  for (let i = 0; i < aliciVerisi.length; i++) {
    const alici = aliciVerisi[i];
    const tacir = tacirler[i % tacirler.length];
    const varisSube = await subeBul(alici[3]);
    const cikisSube = await subeBul(tacir.district);

    const desi = [1, 2, 3, 5, 8][i % 5];
    const ucret = ucretHesapla(tacir, desi);
    // Her üçüncü gönderi kapıda ödemeli
    const kapida = i % 3 === 0 ? [450, 1250, 890, 320, 1750][i % 5] : 0;

    const barkod = `KRG${yil}${(i + 1).toString().padStart(6, '0')}`;

    const gonderi = await tek(
      `INSERT INTO shipments
         (barcode, merchant_id, origin_branch_id, dest_branch_id,
          receiver_name, receiver_phone, receiver_address, receiver_district,
          desi, weight_kg, content, payment_type, shipping_fee, cod_amount,
          status, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'olusturuldu',$15,
               NOW() - ($16 || ' hours')::interval)
       RETURNING *`,
      [barkod, tacir.id, cikisSube.id, varisSube.id,
       alici[0], alici[1], alici[2], alici[3],
       desi, (desi * 0.8).toFixed(2), icerikler[i % icerikler.length],
       kapida > 0 ? 'alici_odemeli' : 'gonderici_odemeli',
       ucret, kapida, admin.id, (aliciVerisi.length - i) * 6]
    );

    await sorgu(
      `INSERT INTO shipment_events (shipment_id, status, description, branch_id, user_id, created_at)
       VALUES ($1, 'olusturuldu', $2, $3, $4, $5)`,
      [gonderi.id, `Gönderi kaydı oluşturuldu. Dağıtım şubesi: ${varisSube.name}`,
       cikisSube.id, admin.id, gonderi.created_at]
    );

    gonderiler.push(gonderi);
  }
  console.log(gonderiler.length + ' gönderi eklendi.');

  // ---- Bazı gönderileri ilerlet ----
  // İlk 6 gönderi teslim edildi
  for (let i = 0; i < 6; i++) {
    const g = gonderiler[i];
    const kurye = kuryeler[i % kuryeler.length];

    await sorgu(
      `UPDATE shipments
          SET status = 'teslim_edildi', courier_id = $1,
              delivered_at = NOW() - ($2 || ' hours')::interval,
              delivered_to = $3, attempt_count = 1,
              signature = 'demo',
              delivery_note = 'Kapıda teslim alındı.'
        WHERE id = $4`,
      [kurye.id, (6 - i) * 5, g.receiver_name, g.id]
    );

    await sorgu(
      `INSERT INTO shipment_events (shipment_id, status, description, branch_id, user_id)
       VALUES ($1, 'subede', 'Şubeye kabul edildi.', $2, $3),
              ($1, 'dagitimda', 'Kuryeye zimmetlendi.', $2, $3),
              ($1, 'teslim_edildi', $4, $2, $3)`,
      [g.id, g.dest_branch_id, kurye.id,
       `${g.receiver_name} kişisine teslim edildi.` +
         (Number(g.cod_amount) > 0
           ? ` Kapıda ödeme tahsil edildi: ${Number(g.cod_amount).toFixed(2)} ₺.`
           : '')]
    );

    if (Number(g.cod_amount) > 0) {
      await sorgu(
        `INSERT INTO cod_collections (shipment_id, amount, method, courier_id, collected_at)
         VALUES ($1, $2, 'nakit', $3, NOW() - ($4 || ' hours')::interval)`,
        [g.id, g.cod_amount, kurye.id, (6 - i) * 5]
      );
    }
  }

  // Sonraki 5 gönderi dağıtımda (kuryeye zimmetli, OTP üretilmiş)
  for (let i = 6; i < 11; i++) {
    const g = gonderiler[i];
    const kurye = kuryeler[i % kuryeler.length];

    await sorgu(
      `UPDATE shipments
          SET status = 'dagitimda', courier_id = $1, otp_code = $2,
              otp_sent_at = NOW(), attempt_count = 1
        WHERE id = $3`,
      [kurye.id, otpUret(), g.id]
    );

    await sorgu(
      `INSERT INTO shipment_events (shipment_id, status, description, branch_id, user_id)
       VALUES ($1, 'subede', 'Şubeye kabul edildi.', $2, $3),
              ($1, 'dagitimda', 'Kuryeye zimmetlendi. Teslimat kodu alıcıya gönderildi.', $2, $3)`,
      [g.id, g.dest_branch_id, kurye.id]
    );
  }

  // Sonraki 5 gönderi şubede bekliyor
  for (let i = 11; i < 16; i++) {
    const g = gonderiler[i];
    await sorgu(`UPDATE shipments SET status = 'subede' WHERE id = $1`, [g.id]);
    await sorgu(
      `INSERT INTO shipment_events (shipment_id, status, description, branch_id, user_id)
       VALUES ($1, 'subede', 'Şubeye kabul edildi.', $2, $3)`,
      [g.id, g.dest_branch_id, admin.id]
    );
  }

  // Bir gönderi teslim edilemedi
  const basarisiz = gonderiler[16];
  await sorgu(
    `UPDATE shipments
        SET status = 'teslim_edilemedi', attempt_count = 2,
            delivery_note = 'Alıcı adreste bulunamadı.'
      WHERE id = $1`,
    [basarisiz.id]
  );
  await sorgu(
    `INSERT INTO shipment_events (shipment_id, status, description, branch_id, user_id)
     VALUES ($1, 'subede', 'Şubeye kabul edildi.', $2, $3),
            ($1, 'dagitimda', 'Kuryeye zimmetlendi.', $2, $3),
            ($1, 'teslim_edilemedi', 'Teslim edilemedi (2. deneme). Sebep: Alıcı adreste bulunamadı.', $2, $3)`,
    [basarisiz.id, basarisiz.dest_branch_id, kuryeler[0].id]
  );

  console.log('Gönderi durumları ayarlandı.');
  console.log('');
  console.log('Demo veriler yüklendi. Şifre hepsinde: 123456');

  await havuz.end();
}

calistir().catch((hata) => {
  console.error('Hata:', hata);
  process.exit(1);
});
