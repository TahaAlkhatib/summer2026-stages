const express = require("express");
const db = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Üye mobil uygulaması uçları — üye yalnızca kendi bilgilerini görür
function uyeId(req, res) {
  if (req.user.role !== "uye") {
    res.status(403).json({ message: "Bu bölüm sadece üyeler içindir." });
    return null;
  }
  return req.user.memberId;
}

// Üyelik durumu ve QR kodu
router.get("/me", async (req, res) => {
  const id = uyeId(req, res);
  if (!id) return;

  try {
    const [uyeler] = await db.query("SELECT * FROM members WHERE id = ?", [id]);
    if (uyeler.length === 0) {
      return res.status(404).json({ message: "Üye bulunamadı." });
    }

    const [uyelikler] = await db.query(
      `SELECT m.*, p.name AS package_name FROM memberships m
       JOIN packages p ON p.id = m.package_id
       WHERE m.member_id = ? ORDER BY m.end_date DESC`,
      [id]
    );

    const aktif = uyelikler.find(
      (u) => u.status === "aktif" && u.end_date >= bugun()
    );

    // Kalan gün sayısı
    let kalanGun = null;
    if (aktif) {
      const bitis = new Date(aktif.end_date + "T00:00:00");
      const simdi = new Date(bugun() + "T00:00:00");
      kalanGun = Math.round((bitis - simdi) / (1000 * 60 * 60 * 24));
    }

    res.json({
      member: {
        id: uyeler[0].id,
        full_name: uyeler[0].full_name,
        phone: uyeler[0].phone,
        qr_code: uyeler[0].qr_code,
      },
      active_membership: aktif
        ? {
            package_name: aktif.package_name,
            start_date: aktif.start_date,
            end_date: aktif.end_date,
            remaining_sessions: aktif.remaining_sessions,
            unlimited: aktif.remaining_sessions === null,
            remaining_days: kalanGun,
            total_price: Number(aktif.total_price),
            paid_amount: Number(aktif.paid_amount),
            remaining_debt: Number(aktif.total_price) - Number(aktif.paid_amount),
          }
        : null,
      past_memberships: uyelikler
        .filter((u) => u !== aktif)
        .map((u) => ({
          package_name: u.package_name,
          start_date: u.start_date,
          end_date: u.end_date,
          status: u.status,
        })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Üyelik bilgisi getirilemedi." });
  }
});

// Üyenin giriş geçmişi
router.get("/checkins", async (req, res) => {
  const id = uyeId(req, res);
  if (!id) return;

  try {
    const [satirlar] = await db.query(
      `SELECT c.created_at, c.result, c.reject_reason, c.method, g.name AS gate_name
       FROM checkins c LEFT JOIN gates g ON g.id = c.gate_id
       WHERE c.member_id = ? ORDER BY c.created_at DESC LIMIT 50`,
      [id]
    );
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Giriş geçmişi getirilemedi." });
  }
});

// Ders programı ve üyenin rezervasyonları
router.get("/classes", async (req, res) => {
  const id = uyeId(req, res);
  if (!id) return;

  try {
    const [dersler] = await db.query(
      `SELECT d.*, u.full_name AS trainer_name FROM classes d
       LEFT JOIN users u ON u.id = d.trainer_id
       WHERE d.is_active = true ORDER BY d.weekday, d.start_time`
    );
    const [rezervasyonlar] = await db.query(
      `SELECT r.*, d.name AS class_name, d.start_time, d.weekday
       FROM class_bookings r JOIN classes d ON d.id = r.class_id
       WHERE r.member_id = ? AND r.booking_date >= CURDATE()
       ORDER BY r.booking_date`,
      [id]
    );

    const GUNLER = ["", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

    res.json({
      classes: dersler.map((d) => ({ ...d, weekday_name: GUNLER[d.weekday] })),
      my_bookings: rezervasyonlar.map((r) => ({ ...r, weekday_name: GUNLER[r.weekday] })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dersler getirilemedi." });
  }
});

function bugun() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

module.exports = router;
