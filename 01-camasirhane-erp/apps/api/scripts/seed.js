// Türkçe demo verisi yükler. Çalıştırma: npm run seed
const bcrypt = require("bcryptjs");
const pool = require("../db");

async function seed() {
  console.log("Demo verisi yükleniyor...");

  // Önce mevcut veriyi temizle
  await pool.query(`TRUNCATE payments, courier_tasks, order_status_history,
                    order_items, orders, services, customers, users RESTART IDENTITY CASCADE`);

  const sifre = bcrypt.hashSync("123456", 10);

  // Personel
  await pool.query(
    `INSERT INTO users (full_name, username, password_hash, role, phone) VALUES
     ('Ahmet Yılmaz',   'admin',    $1, 'admin',   '+90 532 111 22 33'),
     ('Zeynep Kaya',    'kasiyer1', $1, 'kasiyer', '+90 533 222 33 44'),
     ('Mustafa Demir',  'kurye1',   $1, 'kurye',   '+90 534 333 44 55')`,
    [sifre]
  );

  // Hizmetler ve fiyatlar
  await pool.query(
    `INSERT INTO services (name, category, unit, price) VALUES
     ('Gömlek Yıkama + Ütü',        'yikama',         'adet',  45.00),
     ('Takım Elbise Kuru Temizleme','kuru_temizleme', 'adet', 250.00),
     ('Palto / Kaban Kuru Temizleme','kuru_temizleme','adet', 320.00),
     ('Gelinlik Kuru Temizleme',    'kuru_temizleme', 'adet', 900.00),
     ('Battaniye Yıkama',           'yikama',         'adet', 180.00),
     ('Perde Yıkama',               'yikama',         'kg',    90.00),
     ('Halı Yıkama',                'yikama',         'm2',   120.00),
     ('Leke Çıkarma (Özel İşlem)',  'leke',           'adet',  75.00)`
  );

  // Müşteriler
  await pool.query(
    `INSERT INTO customers (full_name, phone, address, district) VALUES
     ('Elif Şahin',      '+90 535 401 11 21', 'Bağdat Cad. No:112 D:5',   'Kadıköy'),
     ('Burak Aydın',     '+90 536 402 12 22', 'Barbaros Bulvarı No:38',   'Beşiktaş'),
     ('Merve Doğan',     '+90 537 403 13 23', 'Çamlıca Mah. 12. Sok No:7','Üsküdar'),
     ('Emre Çelik',      '+90 538 404 14 24', 'Halaskargazi Cad. No:200', 'Şişli'),
     ('Ayşe Koç',        '+90 539 405 15 25', 'İncirli Cad. No:45 D:3',   'Bakırköy'),
     ('Kerem Arslan',    '+90 505 406 16 26', 'Nispetiye Cad. No:18',     'Beşiktaş'),
     ('Selin Yıldız',    '+90 506 407 17 27', 'Moda Cad. No:88 D:2',      'Kadıköy'),
     ('Onur Polat',      '+90 507 408 18 28', 'Atatürk Bulvarı No:15',    'Ataşehir'),
     ('Deniz Kurt',      '+90 508 409 19 29', 'Bahariye Cad. No:60',      'Kadıköy'),
     ('Hakan Öztürk',    '+90 509 410 20 30', 'Kartaltepe Mah. No:9',     'Bakırköy')`
  );

  // Siparişler — her durumdan örnek olsun
  const durumlar = ["alindi", "yikamada", "utude", "hazir", "hazir", "teslim_edildi", "teslim_edildi", "alindi"];
  const teslimTipleri = ["magaza", "kurye", "magaza", "kurye", "magaza", "kurye", "magaza", "kurye"];

  for (let i = 0; i < durumlar.length; i++) {
    const orderNo = "SP-2026-" + String(i + 1).padStart(5, "0");
    const customerId = (i % 10) + 1;
    const durum = durumlar[i];
    const teslimTipi = teslimTipleri[i];
    const kuryeId = teslimTipi === "kurye" ? 3 : null;
    const teslimTarihi = durum === "teslim_edildi" ? new Date() : null;

    const siparis = await pool.query(
      `INSERT INTO orders (order_no, customer_id, status, delivery_type, promised_date,
                           courier_id, created_by, created_at, delivered_at)
       VALUES ($1, $2, $3, $4, CURRENT_DATE + 2, $5, 2,
               NOW() - ($6 || ' days')::interval, $7)
       RETURNING id`,
      [orderNo, customerId, durum, teslimTipi, kuryeId, String(7 - i), teslimTarihi]
    );
    const orderId = siparis.rows[0].id;

    // Her siparişe 2 kalem ekle
    let toplam = 0;
    for (let j = 0; j < 2; j++) {
      const serviceId = ((i + j) % 8) + 1;
      const hizmet = await pool.query("SELECT name, price FROM services WHERE id = $1", [serviceId]);
      const adet = j + 1;
      const birimFiyat = Number(hizmet.rows[0].price);
      const satirToplam = adet * birimFiyat;
      toplam += satirToplam;

      await pool.query(
        `INSERT INTO order_items (order_id, service_id, item_name, quantity, unit_price, line_total, barcode)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, serviceId, hizmet.rows[0].name, adet, birimFiyat, satirToplam,
         orderNo + "-" + String(j + 1).padStart(2, "0")]
      );
    }

    await pool.query("UPDATE orders SET total_amount = $1 WHERE id = $2", [toplam, orderId]);

    // Durum geçmişi
    await pool.query(
      "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, 'alindi', 2, 'Sipariş oluşturuldu')",
      [orderId]
    );
    if (durum !== "alindi") {
      await pool.query(
        "INSERT INTO order_status_history (order_id, status, changed_by) VALUES ($1, $2, 2)",
        [orderId, durum]
      );
    }

    // Teslim edilenler ödenmiş sayılsın
    if (durum === "teslim_edildi") {
      await pool.query(
        "INSERT INTO payments (order_id, amount, method, received_by) VALUES ($1, $2, 'nakit', 2)",
        [orderId, toplam]
      );
      await pool.query("UPDATE orders SET paid_amount = $1 WHERE id = $2", [toplam, orderId]);
    }

    // Kurye görevleri
    if (teslimTipi === "kurye") {
      const musteri = await pool.query("SELECT address, district FROM customers WHERE id = $1", [customerId]);
      const adres = musteri.rows[0].address + " / " + musteri.rows[0].district;
      await pool.query(
        `INSERT INTO courier_tasks (order_id, courier_id, task_type, status, address, scheduled_at)
         VALUES ($1, 3, 'teslim', $2, $3, NOW() + interval '1 day')`,
        [orderId, durum === "teslim_edildi" ? "tamamlandi" : "bekliyor", adres]
      );
    }
  }

  console.log("Demo verisi yüklendi.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Demo verisi yüklenemedi:", err);
  process.exit(1);
});
