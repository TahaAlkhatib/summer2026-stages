const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Durum kodlarının Türkçe karşılıkları
const DURUM_ETIKETLERI = {
  alindi: "Teslim Alındı",
  yikamada: "Yıkamada",
  utude: "Ütüde",
  hazir: "Hazır",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

// Yeni sipariş oluştur
router.post("/", async (req, res) => {
  const { customer_id, delivery_type, promised_date, notes, items } = req.body;

  if (!customer_id) {
    return res.status(400).json({ message: "Müşteri seçilmelidir." });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Siparişe en az bir hizmet eklenmelidir." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Sipariş numarasını üret
    const yil = new Date().getFullYear();
    const sayac = await client.query(
      "SELECT COUNT(*) FROM orders WHERE order_no LIKE $1",
      ["SP-" + yil + "-%"]
    );
    const sira = parseInt(sayac.rows[0].count) + 1;
    const orderNo = "SP-" + yil + "-" + String(sira).padStart(5, "0");

    const siparis = await client.query(
      `INSERT INTO orders (order_no, customer_id, delivery_type, promised_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, order_no`,
      [orderNo, customer_id, delivery_type || "magaza", promised_date || null,
       notes || null, req.user.id]
    );
    const orderId = siparis.rows[0].id;

    // Kalemler ve barkodlar
    let toplam = 0;
    const eklenenKalemler = [];
    for (let i = 0; i < items.length; i++) {
      const kalem = items[i];
      const hizmet = await client.query("SELECT name, price FROM services WHERE id = $1", [kalem.service_id]);
      if (hizmet.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Seçilen hizmet bulunamadı." });
      }
      const adet = Number(kalem.quantity);
      if (!adet || adet <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Miktar sıfırdan büyük olmalıdır." });
      }
      const birimFiyat = Number(hizmet.rows[0].price);
      const satirToplam = adet * birimFiyat;
      toplam += satirToplam;

      const barkod = orderNo + "-" + String(i + 1).padStart(2, "0");
      const eklenen = await client.query(
        `INSERT INTO order_items (order_id, service_id, item_name, quantity, unit_price, line_total, barcode, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, barcode, item_name, quantity, unit_price, line_total`,
        [orderId, kalem.service_id, kalem.item_name || hizmet.rows[0].name,
         adet, birimFiyat, satirToplam, barkod, kalem.notes || null]
      );
      eklenenKalemler.push(eklenen.rows[0]);
    }

    await client.query("UPDATE orders SET total_amount = $1 WHERE id = $2", [toplam, orderId]);
    await client.query(
      "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, 'alindi', $2, 'Sipariş oluşturuldu')",
      [orderId, req.user.id]
    );

    // Kurye teslimi seçildiyse görev aç
    if (delivery_type === "kurye") {
      const musteri = await client.query("SELECT address, district FROM customers WHERE id = $1", [customer_id]);
      const adres = (musteri.rows[0].address || "") + " / " + (musteri.rows[0].district || "");
      await client.query(
        `INSERT INTO courier_tasks (order_id, courier_id, task_type, address, scheduled_at)
         SELECT $1, id, 'teslim', $2, NOW() + interval '1 day' FROM users WHERE role = 'kurye' AND is_active = true LIMIT 1`,
        [orderId, adres]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({
      id: orderId,
      order_no: orderNo,
      total_amount: toplam,
      items: eklenenKalemler,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Sipariş oluşturulamadı." });
  } finally {
    client.release();
  }
});

// Sipariş listesi — durum, arama ve tarih filtreli
router.get("/", async (req, res) => {
  const { status, q, date } = req.query;
  try {
    let sql = `SELECT o.id, o.order_no, o.status, o.total_amount, o.paid_amount,
                      o.delivery_type, o.promised_date, o.created_at,
                      c.full_name AS customer_name, c.phone AS customer_phone,
                      (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS item_count
               FROM orders o
               JOIN customers c ON c.id = o.customer_id
               WHERE 1 = 1`;
    const params = [];

    if (status) {
      params.push(status);
      sql += " AND o.status = $" + params.length;
    }
    if (q) {
      params.push("%" + q + "%");
      sql += " AND (o.order_no ILIKE $" + params.length + " OR c.full_name ILIKE $" + params.length + ")";
    }
    if (date) {
      params.push(date);
      sql += " AND DATE(o.created_at) = $" + params.length;
    }
    sql += " ORDER BY o.created_at DESC";

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Siparişler getirilemedi." });
  }
});

// Sipariş detayı
router.get("/:id", async (req, res) => {
  try {
    const siparis = await pool.query(
      `SELECT o.*, u.full_name AS created_by_name
       FROM orders o LEFT JOIN users u ON u.id = o.created_by
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (siparis.rows.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    const cevap = siparis.rows[0];
    const musteri = await pool.query("SELECT * FROM customers WHERE id = $1", [cevap.customer_id]);
    const kalemler = await pool.query("SELECT * FROM order_items WHERE order_id = $1 ORDER BY id", [req.params.id]);
    const gecmis = await pool.query(
      `SELECT h.*, u.full_name AS changed_by_name
       FROM order_status_history h LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.order_id = $1 ORDER BY h.changed_at`,
      [req.params.id]
    );
    const odemeler = await pool.query("SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at", [req.params.id]);
    const gorev = await pool.query("SELECT * FROM courier_tasks WHERE order_id = $1 ORDER BY id DESC LIMIT 1", [req.params.id]);

    cevap.status_label = DURUM_ETIKETLERI[cevap.status];
    cevap.customer = musteri.rows[0];
    cevap.items = kalemler.rows;
    cevap.history = gecmis.rows;
    cevap.payments = odemeler.rows;
    cevap.courier_task = gorev.rows[0] || null;
    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş getirilemedi." });
  }
});

// Sipariş aşamasını güncelle
router.put("/:id/status", async (req, res) => {
  const { status, note } = req.body;

  if (!DURUM_ETIKETLERI[status]) {
    return res.status(400).json({ message: "Geçersiz sipariş durumu." });
  }

  try {
    const mevcut = await pool.query("SELECT status FROM orders WHERE id = $1", [req.params.id]);
    if (mevcut.rows.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }
    if (mevcut.rows[0].status === "teslim_edildi") {
      return res.status(400).json({ message: "Teslim edilmiş sipariş güncellenemez." });
    }

    // delivered_at'i JS tarafinda hesapliyoruz; ayni parametreyi hem kolonda hem
    // CASE icinde kullanmak PostgreSQL'de tip cakismasina yol aciyor
    const teslimTarihi = status === "teslim_edildi" ? new Date() : null;

    const result = await pool.query(
      `UPDATE orders SET status = $1, delivered_at = COALESCE($2, delivered_at)
       WHERE id = $3 RETURNING id, order_no, status`,
      [status, teslimTarihi, req.params.id]
    );
    await pool.query(
      "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, $2, $3, $4)",
      [req.params.id, status, req.user.id, note || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş durumu güncellenemedi." });
  }
});

// Barkod ile kalem/sipariş bul (kasa uygulaması barkod okutunca kullanır)
router.get("/barcode/:barcode", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.order_id, i.item_name, i.quantity, o.order_no, o.status,
              c.full_name AS customer_name, c.phone AS customer_phone
       FROM order_items i
       JOIN orders o ON o.id = i.order_id
       JOIN customers c ON c.id = o.customer_id
       WHERE i.barcode = $1`,
      [req.params.barcode]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Bu barkoda ait kayıt bulunamadı." });
    }
    const kayit = result.rows[0];
    kayit.status_label = DURUM_ETIKETLERI[kayit.status];
    res.json(kayit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Barkod sorgulanamadı." });
  }
});

// Barkod okutup doğrudan aşama güncelle
router.put("/barcode/:barcode/status", async (req, res) => {
  const { status } = req.body;
  if (!DURUM_ETIKETLERI[status]) {
    return res.status(400).json({ message: "Geçersiz sipariş durumu." });
  }
  try {
    const kalem = await pool.query("SELECT order_id FROM order_items WHERE barcode = $1", [req.params.barcode]);
    if (kalem.rows.length === 0) {
      return res.status(404).json({ message: "Bu barkoda ait kayıt bulunamadı." });
    }
    const orderId = kalem.rows[0].order_id;

    const mevcut = await pool.query("SELECT status FROM orders WHERE id = $1", [orderId]);
    if (mevcut.rows[0].status === "teslim_edildi") {
      return res.status(400).json({ message: "Teslim edilmiş sipariş güncellenemez." });
    }

    const teslimTarihi = status === "teslim_edildi" ? new Date() : null;

    const result = await pool.query(
      `UPDATE orders SET status = $1, delivered_at = COALESCE($2, delivered_at)
       WHERE id = $3 RETURNING id, order_no, status`,
      [status, teslimTarihi, orderId]
    );
    await pool.query(
      "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, $2, $3, 'Barkod okutularak güncellendi')",
      [orderId, status, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş durumu güncellenemedi." });
  }
});

module.exports = router;
