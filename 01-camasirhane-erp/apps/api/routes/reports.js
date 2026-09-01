const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Gün sonu kasa raporu
router.get("/daily", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  try {
    // Tarih verilmediyse veritabaninin yerel gununu kullaniyoruz.
    // new Date().toISOString() UTC dondurdugu icin gece 00:00-03:00 arasinda
    // bir onceki gunun raporunu getiriyordu (Turkiye UTC+3).
    const cozulen = await pool.query(
      "SELECT TO_CHAR(COALESCE($1::date, CURRENT_DATE), 'YYYY-MM-DD') AS tarih",
      [req.query.date || null]
    );
    const tarih = cozulen.rows[0].tarih;

    const siparisler = await pool.query(
      `SELECT o.order_no, o.total_amount, o.paid_amount, o.status, c.full_name AS customer_name
       FROM orders o JOIN customers c ON c.id = o.customer_id
       WHERE DATE(o.created_at) = $1 ORDER BY o.created_at`,
      [tarih]
    );

    const tahsilat = await pool.query(
      `SELECT method, COALESCE(SUM(amount), 0) AS tutar
       FROM payments WHERE DATE(created_at) = $1 GROUP BY method`,
      [tarih]
    );

    const teslim = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE DATE(delivered_at) = $1",
      [tarih]
    );

    const kasa = { nakit: 0, kart: 0, havale: 0, toplam: 0 };
    tahsilat.rows.forEach((s) => {
      kasa[s.method] = Number(s.tutar);
      kasa.toplam += Number(s.tutar);
    });

    let ciro = 0;
    siparisler.rows.forEach((s) => (ciro += Number(s.total_amount)));

    res.json({
      date: tarih,
      order_count: siparisler.rows.length,
      total_amount: ciro,
      collected: kasa,
      delivered_count: Number(teslim.rows[0].count),
      orders: siparisler.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rapor hazırlanamadı." });
  }
});

// Yönetim paneli özeti
router.get("/summary", async (req, res) => {
  try {
    const durumlar = await pool.query("SELECT status, COUNT(*) FROM orders GROUP BY status");
    const bugun = await pool.query(
      "SELECT COUNT(*) AS adet, COALESCE(SUM(total_amount), 0) AS ciro FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );
    const ay = await pool.query(
      `SELECT COUNT(*) AS adet, COALESCE(SUM(total_amount), 0) AS ciro FROM orders
       WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`
    );
    const bekleyenGorev = await pool.query(
      "SELECT COUNT(*) FROM courier_tasks WHERE status IN ('bekliyor','yolda')"
    );
    const borc = await pool.query(
      `SELECT COALESCE(SUM(total_amount - paid_amount), 0) AS tutar FROM orders
       WHERE status <> 'iptal' AND total_amount > paid_amount`
    );
    const enCokHizmet = await pool.query(
      `SELECT s.name, COUNT(DISTINCT i.order_id) AS order_count, COALESCE(SUM(i.line_total), 0) AS revenue
       FROM order_items i JOIN services s ON s.id = i.service_id
       GROUP BY s.name ORDER BY revenue DESC LIMIT 5`
    );

    const durumSayilari = { alindi: 0, yikamada: 0, utude: 0, hazir: 0, teslim_edildi: 0, iptal: 0 };
    durumlar.rows.forEach((s) => (durumSayilari[s.status] = Number(s.count)));

    res.json({
      status_counts: durumSayilari,
      today: { order_count: Number(bugun.rows[0].adet), total_amount: Number(bugun.rows[0].ciro) },
      month: { order_count: Number(ay.rows[0].adet), total_amount: Number(ay.rows[0].ciro) },
      pending_courier_tasks: Number(bekleyenGorev.rows[0].count),
      unpaid_total: Number(borc.rows[0].tutar),
      top_services: enCokHizmet.rows.map((h) => ({
        name: h.name,
        order_count: Number(h.order_count),
        revenue: Number(h.revenue),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Özet hazırlanamadı." });
  }
});

module.exports = router;
