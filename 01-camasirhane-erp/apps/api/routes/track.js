// Müşteri takip ucu — giriş gerektirmez, sipariş no veya barkod ile sorgulanır
const express = require("express");
const pool = require("../db");

const router = express.Router();

const DURUM_ETIKETLERI = {
  alindi: "Teslim Alındı",
  yikamada: "Yıkamada",
  utude: "Ütüde",
  hazir: "Hazır",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

router.get("/:code", async (req, res) => {
  const kod = req.params.code.trim();
  try {
    // Hem sipariş numarası hem barkod kabul edilir
    const result = await pool.query(
      `SELECT o.id, o.order_no, o.status, o.promised_date, o.created_at,
              c.full_name AS customer_name,
              (SELECT COUNT(*) FROM order_items i2 WHERE i2.order_id = o.id) AS item_count
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.order_no = $1
          OR o.id = (SELECT order_id FROM order_items WHERE barcode = $1)`,
      [kod]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı. Lütfen numarayı kontrol edin." });
    }

    const siparis = result.rows[0];
    const gecmis = await pool.query(
      "SELECT status, changed_at FROM order_status_history WHERE order_id = $1 ORDER BY changed_at",
      [siparis.id]
    );

    res.json({
      order_no: siparis.order_no,
      status: siparis.status,
      status_label: DURUM_ETIKETLERI[siparis.status],
      promised_date: siparis.promised_date,
      created_at: siparis.created_at,
      customer_name: siparis.customer_name,
      item_count: Number(siparis.item_count),
      history: gecmis.rows.map((s) => ({
        status: s.status,
        status_label: DURUM_ETIKETLERI[s.status],
        changed_at: s.changed_at,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş sorgulanamadı." });
  }
});

module.exports = router;
