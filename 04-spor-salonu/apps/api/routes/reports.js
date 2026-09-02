const express = require("express");
const db = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Yönetim paneli özeti
router.get("/summary", async (req, res) => {
  try {
    const [uyeSayisi] = await db.query("SELECT COUNT(*) AS adet FROM members WHERE is_active = true");
    const [aktifUyelik] = await db.query(
      "SELECT COUNT(*) AS adet FROM memberships WHERE status = 'aktif' AND end_date >= CURDATE()"
    );
    const [bugunGiris] = await db.query(
      "SELECT COUNT(*) AS adet FROM checkins WHERE result = 'izin' AND DATE(created_at) = CURDATE()"
    );
    const [bugunRed] = await db.query(
      "SELECT COUNT(*) AS adet FROM checkins WHERE result = 'red' AND DATE(created_at) = CURDATE()"
    );
    const [ayTahsilat] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS tutar FROM payments
       WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`
    );
    const [ayBufe] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS tutar FROM sales
       WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`
    );
    const [borc] = await db.query(
      `SELECT COALESCE(SUM(total_price - paid_amount), 0) AS tutar FROM memberships
       WHERE total_price > paid_amount`
    );
    // Yakında bitecek üyelikler (7 gün içinde)
    const [bitecek] = await db.query(
      `SELECT m.id, m.end_date, u.full_name, u.phone, p.name AS package_name
       FROM memberships m
       JOIN members u ON u.id = m.member_id
       JOIN packages p ON p.id = m.package_id
       WHERE m.status = 'aktif' AND m.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY m.end_date`
    );
    // En çok kullanılan paketler
    const [paketler] = await db.query(
      `SELECT p.name, COUNT(*) AS adet, COALESCE(SUM(m.total_price), 0) AS ciro
       FROM memberships m JOIN packages p ON p.id = m.package_id
       GROUP BY p.id, p.name ORDER BY ciro DESC LIMIT 5`
    );

    res.json({
      member_count: uyeSayisi[0].adet,
      active_membership_count: aktifUyelik[0].adet,
      today_entries: bugunGiris[0].adet,
      today_rejects: bugunRed[0].adet,
      month_membership_revenue: Number(ayTahsilat[0].tutar),
      month_shop_revenue: Number(ayBufe[0].tutar),
      unpaid_total: Number(borc[0].tutar),
      expiring_soon: bitecek,
      top_packages: paketler.map((p) => ({
        name: p.name, count: p.adet, revenue: Number(p.ciro),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Özet hazırlanamadı." });
  }
});

// Gün sonu kasa raporu
router.get("/daily", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  // Tarih verilmediyse yerel günü kullan (UTC değil)
  let tarih = req.query.date;
  if (!tarih) {
    const d = new Date();
    tarih = d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  try {
    const [uyelikOdemeleri] = await db.query(
      `SELECT method, COALESCE(SUM(amount), 0) AS tutar FROM payments
       WHERE DATE(created_at) = ? GROUP BY method`,
      [tarih]
    );
    const [bufeSatislari] = await db.query(
      `SELECT method, COALESCE(SUM(total_amount), 0) AS tutar FROM sales
       WHERE DATE(created_at) = ? GROUP BY method`,
      [tarih]
    );
    const [girisler] = await db.query(
      `SELECT result, COUNT(*) AS adet FROM checkins
       WHERE DATE(created_at) = ? GROUP BY result`,
      [tarih]
    );
    const [yeniUyelikler] = await db.query(
      `SELECT m.*, u.full_name, p.name AS package_name FROM memberships m
       JOIN members u ON u.id = m.member_id JOIN packages p ON p.id = m.package_id
       WHERE DATE(m.created_at) = ? ORDER BY m.created_at`,
      [tarih]
    );

    const kasa = { nakit: 0, kart: 0, havale: 0, toplam: 0 };
    uyelikOdemeleri.forEach((s) => {
      kasa[s.method] = (kasa[s.method] || 0) + Number(s.tutar);
      kasa.toplam += Number(s.tutar);
    });
    const bufe = { nakit: 0, kart: 0, toplam: 0 };
    bufeSatislari.forEach((s) => {
      bufe[s.method] = (bufe[s.method] || 0) + Number(s.tutar);
      bufe.toplam += Number(s.tutar);
    });

    const girisSayilari = { izin: 0, red: 0 };
    girisler.forEach((g) => { girisSayilari[g.result] = g.adet; });

    res.json({
      date: tarih,
      membership_collected: kasa,
      shop_collected: bufe,
      grand_total: kasa.toplam + bufe.toplam,
      entries: girisSayilari,
      new_memberships: yeniUyelikler,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rapor hazırlanamadı." });
  }
});

// Antrenör listesi (ders atama için)
router.get("/trainers", async (req, res) => {
  try {
    const [satirlar] = await db.query(
      "SELECT id, full_name FROM users WHERE role = 'antrenor' AND is_active = true ORDER BY full_name"
    );
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Antrenörler getirilemedi." });
  }
});

module.exports = router;
