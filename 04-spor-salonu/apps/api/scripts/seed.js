// Türkçe demo verisi. Çalıştırma: npm run seed
const bcrypt = require("bcryptjs");
const db = require("../db");

// Yerel tarih yardımcıları (UTC kayması olmasın diye)
function yerelTarih(gunEkle) {
  const d = new Date();
  if (gunEkle) d.setDate(d.getDate() + gunEkle);
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

async function seed() {
  console.log("Demo verisi yükleniyor...");

  // Mevcut veriyi temizle (yabancı anahtar sırasına dikkat)
  await db.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const tablo of ["sale_items", "sales", "products", "class_bookings", "classes",
                        "checkins", "gates", "payments", "memberships", "packages",
                        "members", "users"]) {
    await db.query("TRUNCATE TABLE " + tablo);
  }
  await db.query("SET FOREIGN_KEY_CHECKS = 1");

  const sifre = bcrypt.hashSync("123456", 10);

  // Personel
  await db.query(
    `INSERT INTO users (full_name, username, password_hash, role, phone) VALUES
     ('Ahmet Yılmaz',   'admin',     ?, 'admin',    '+90 532 111 22 33'),
     ('Zeynep Kaya',    'kasiyer1',  ?, 'kasiyer',  '+90 533 222 33 44'),
     ('Mustafa Demir',  'antrenor1', ?, 'antrenor', '+90 534 333 44 55'),
     ('Selin Yıldız',   'antrenor2', ?, 'antrenor', '+90 535 444 55 66')`,
    [sifre, sifre, sifre, sifre]
  );

  // Turnikeler
  await db.query(
    `INSERT INTO gates (name, location, direction) VALUES
     ('Ana Giriş Turnikesi', 'Zemin Kat - Resepsiyon', 'giris'),
     ('Çıkış Turnikesi',     'Zemin Kat - Resepsiyon', 'cikis'),
     ('Havuz Turnikesi',     '-1 Kat - Havuz Girişi',  'giris')`
  );

  // Üyelik paketleri
  await db.query(
    `INSERT INTO packages (name, duration_days, session_count, price) VALUES
     ('Aylık Sınırsız',       30,  NULL, 1200.00),
     ('3 Aylık Sınırsız',     90,  NULL, 3000.00),
     ('Yıllık Sınırsız',      365, NULL, 9600.00),
     ('10 Seans Paketi',      60,  10,   900.00),
     ('20 Seans Paketi',      120, 20,   1600.00),
     ('Öğrenci Aylık',        30,  NULL, 750.00)`
  );

  // Üyeler
  const uyeler = [
    ["Elif Şahin",    "+90 535 401 11 21", "elif.sahin@ornek.com",   "1995-04-15", "kadin", "1001"],
    ["Burak Aydın",   "+90 536 402 12 22", "burak.aydin@ornek.com",  "1988-11-03", "erkek", "1002"],
    ["Merve Doğan",   "+90 537 403 13 23", "merve.dogan@ornek.com",  "1999-07-22", "kadin", "1003"],
    ["Emre Çelik",    "+90 538 404 14 24", "emre.celik@ornek.com",   "1982-01-30", "erkek", "1004"],
    ["Ayşe Koç",      "+90 539 405 15 25", "ayse.koc@ornek.com",     "2001-09-08", "kadin", "1005"],
    ["Kerem Arslan",  "+90 505 406 16 26", "kerem.arslan@ornek.com", "1993-03-17", "erkek", "1006"],
    ["Onur Polat",    "+90 507 408 18 28", "onur.polat@ornek.com",   "1975-06-11", "erkek", "1007"],
    ["Deniz Kurt",    "+90 508 409 19 29", "deniz.kurt@ornek.com",   "1997-12-05", "kadin", "1008"],
  ];

  for (let i = 0; i < uyeler.length; i++) {
    const [ad, tel, eposta, dogum, cinsiyet, rfid] = uyeler[i];
    const qr = "UYE-2026-" + String(i + 1).padStart(5, "0");
    await db.query(
      `INSERT INTO members (full_name, phone, email, birth_date, gender, qr_code, rfid_card)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ad, tel, eposta, dogum, cinsiyet, qr, rfid]
    );
  }

  // Üyelikler — farklı durumlar (aktif, süresi dolmuş, seansı bitmiş, borçlu)
  const uyelikTanimlari = [
    // [uye_id, paket_id, baslangic_gun_farki, odenen_oran, seans_override]
    [1, 1, -10, 1.0, null],   // aktif aylık, ödenmiş
    [2, 2, -30, 1.0, null],   // aktif 3 aylık, ödenmiş
    [3, 4, -20, 1.0, 3],      // 10 seanslık, 3 seansı kalmış
    [4, 1, -45, 1.0, null],   // süresi dolmuş aylık
    [5, 5, -5,  0.5, 18],     // 20 seanslık, yarısı ödenmiş (borçlu)
    [6, 3, -100, 1.0, null],  // aktif yıllık
    [7, 4, -10, 1.0, 0],      // tarihi geçerli ama seans hakkı bitmiş
    [8, 6, -2,  1.0, null],   // yeni öğrenci üyeliği
  ];

  for (const [uyeId, paketId, gunFarki, odenenOran, seansOverride] of uyelikTanimlari) {
    const [paketler] = await db.query("SELECT * FROM packages WHERE id = ?", [paketId]);
    const paket = paketler[0];

    const baslangic = yerelTarih(gunFarki);
    const bitisTarihi = new Date(baslangic + "T00:00:00");
    bitisTarihi.setDate(bitisTarihi.getDate() + paket.duration_days);
    const bitis = bitisTarihi.getFullYear() + "-" +
      String(bitisTarihi.getMonth() + 1).padStart(2, "0") + "-" +
      String(bitisTarihi.getDate()).padStart(2, "0");

    const durum = bitis < yerelTarih() ? "bitti" : "aktif";
    const kalanSeans = seansOverride !== null ? seansOverride : paket.session_count;
    const odenen = Number(paket.price) * odenenOran;

    const [sonuc] = await db.query(
      `INSERT INTO memberships (member_id, package_id, start_date, end_date,
                                remaining_sessions, status, total_price, paid_amount, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2)`,
      [uyeId, paketId, baslangic, bitis, kalanSeans, durum, paket.price, odenen]
    );

    if (odenen > 0) {
      await db.query(
        "INSERT INTO payments (membership_id, amount, method, received_by) VALUES (?, ?, ?, 2)",
        [sonuc.insertId, odenen, uyeId % 2 === 0 ? "kart" : "nakit"]
      );
    }
  }

  // Grup dersleri
  await db.query(
    `INSERT INTO classes (name, trainer_id, weekday, start_time, capacity) VALUES
     ('Sabah Pilates',    3, 1, '09:00', 15),
     ('Akşam Yoga',       4, 1, '19:00', 20),
     ('Spinning',         3, 2, '18:30', 25),
     ('Fonksiyonel Antrenman', 3, 3, '18:00', 18),
     ('Akşam Yoga',       4, 4, '19:00', 20),
     ('Zumba',            4, 5, '18:30', 30),
     ('Hafta Sonu Pilates', 3, 6, '11:00', 15)`
  );

  // Büfe ürünleri
  await db.query(
    `INSERT INTO products (code, name, price, stock_quantity) VALUES
     ('BF-001', 'Su 0.5 L',              15.00, 240),
     ('BF-002', 'Protein Bar',           85.00, 60),
     ('BF-003', 'Protein Shake',        120.00, 45),
     ('BF-004', 'İzotonik İçecek',       45.00, 80),
     ('BF-005', 'Enerji Jeli',           55.00, 35),
     ('BF-006', 'Havlu Kiralama',        40.00, 25),
     ('BF-007', 'Spor Eldiveni',        250.00, 12),
     ('BF-008', 'Shaker',               180.00, 18)`
  );

  // Bugünkü ve dünkü turnike giriş kayıtları
  const girisler = [
    [1, 1, 1, "qr", "izin", null],
    [2, 2, 1, "rfid", "izin", null],
    [3, 3, 1, "qr", "izin", null],
    [4, null, 1, "qr", "red", "Üyelik süresi dolmuş."],
    [6, 6, 3, "rfid", "izin", null],
    [7, null, 1, "qr", "red", "Seans hakkı bitmiş."],
    [null, null, 1, "qr", "red", "Kart tanınmadı."],
    [8, 8, 1, "qr", "izin", null],
  ];

  for (let i = 0; i < girisler.length; i++) {
    const [uyeId, uyelikId, kapiId, yontem, sonuc, sebep] = girisler[i];
    const kod = uyeId ? "UYE-2026-" + String(uyeId).padStart(5, "0") : "XXXX-9999";
    await db.query(
      `INSERT INTO checkins (member_id, membership_id, gate_id, method, result, reject_reason, scanned_code, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? MINUTE))`,
      [uyeId, uyelikId, kapiId, yontem, sonuc, sebep, kod, (girisler.length - i) * 37]
    );
  }

  // Büfe satışları
  const [satis1] = await db.query(
    "INSERT INTO sales (sale_no, member_id, total_amount, method, sold_by) VALUES ('ST-2026-00001', 1, 135.00, 'nakit', 2)"
  );
  await db.query(
    `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total) VALUES
     (?, 1, 1, 15.00, 15.00), (?, 3, 1, 120.00, 120.00)`,
    [satis1.insertId, satis1.insertId]
  );
  await db.query("UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id IN (1, 3)");

  const [satis2] = await db.query(
    "INSERT INTO sales (sale_no, member_id, total_amount, method, sold_by) VALUES ('ST-2026-00002', 2, 170.00, 'kart', 2)"
  );
  await db.query(
    `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total) VALUES
     (?, 2, 2, 85.00, 170.00)`,
    [satis2.insertId]
  );
  await db.query("UPDATE products SET stock_quantity = stock_quantity - 2 WHERE id = 2");

  // Ders rezervasyonları — bu haftanın uygun günlerine
  const bugunGun = new Date().getDay() === 0 ? 7 : new Date().getDay();
  for (const [dersId, dersGun, uyeId] of [[1, 1, 1], [1, 1, 3], [3, 2, 2], [6, 5, 5]]) {
    let fark = dersGun - bugunGun;
    if (fark < 0) fark += 7;
    await db.query(
      "INSERT IGNORE INTO class_bookings (class_id, member_id, booking_date) VALUES (?, ?, ?)",
      [dersId, uyeId, yerelTarih(fark)]
    );
  }

  console.log("Demo verisi yüklendi.");
  await db.end();
}

seed().catch((err) => {
  console.error("Demo verisi yüklenemedi:", err);
  process.exit(1);
});
