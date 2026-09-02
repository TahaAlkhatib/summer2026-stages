const express = require("express");
const db = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

const GUNLER = ["", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Haftalık ders programı
router.get("/", async (req, res) => {
  try {
    const [satirlar] = await db.query(
      `SELECT d.*, u.full_name AS trainer_name,
              (SELECT COUNT(*) FROM class_bookings r
               WHERE r.class_id = d.id AND r.booking_date >= CURDATE()
                 AND r.status = 'rezerve') AS upcoming_bookings
       FROM classes d
       LEFT JOIN users u ON u.id = d.trainer_id
       WHERE d.is_active = true
       ORDER BY d.weekday, d.start_time`
    );

    res.json(satirlar.map((d) => ({
      ...d,
      weekday_name: GUNLER[d.weekday],
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dersler getirilemedi." });
  }
});

// Bir dersin belirli tarihteki rezervasyonları
router.get("/:id/bookings", async (req, res) => {
  const tarih = req.query.date;
  if (!tarih) {
    return res.status(400).json({ message: "Tarih seçilmelidir." });
  }
  try {
    const [satirlar] = await db.query(
      `SELECT r.*, u.full_name AS member_name, u.phone
       FROM class_bookings r JOIN members u ON u.id = r.member_id
       WHERE r.class_id = ? AND r.booking_date = ?
       ORDER BY r.created_at`,
      [req.params.id, tarih]
    );
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rezervasyonlar getirilemedi." });
  }
});

// Derse rezervasyon — kapasite ve aktif üyelik kontrolü yapılır
router.post("/:id/bookings", async (req, res) => {
  const { member_id, booking_date } = req.body;

  if (!member_id || !booking_date) {
    return res.status(400).json({ message: "Üye ve tarih zorunludur." });
  }

  try {
    const [dersler] = await db.query("SELECT * FROM classes WHERE id = ?", [req.params.id]);
    if (dersler.length === 0) {
      return res.status(404).json({ message: "Ders bulunamadı." });
    }
    const ders = dersler[0];

    // Seçilen tarih dersin gününe denk geliyor mu
    const gun = new Date(booking_date + "T00:00:00").getDay();
    const haftaninGunu = gun === 0 ? 7 : gun;
    if (haftaninGunu !== ders.weekday) {
      return res.status(400).json({
        message: "Bu ders " + GUNLER[ders.weekday] + " günleri yapılıyor.",
      });
    }

    // Üyenin aktif üyeliği var mı
    const [uyelikler] = await db.query(
      `SELECT * FROM memberships WHERE member_id = ? AND status = 'aktif'
         AND start_date <= ? AND end_date >= ?`,
      [member_id, booking_date, booking_date]
    );
    if (uyelikler.length === 0) {
      return res.status(400).json({
        message: "Üyenin bu tarihte geçerli bir üyeliği yok.",
      });
    }

    // Kapasite dolmuş mu
    const [sayac] = await db.query(
      `SELECT COUNT(*) AS adet FROM class_bookings
       WHERE class_id = ? AND booking_date = ? AND status = 'rezerve'`,
      [req.params.id, booking_date]
    );
    if (sayac[0].adet >= ders.capacity) {
      return res.status(400).json({
        message: "Ders kontenjanı dolu (" + ders.capacity + " kişi).",
      });
    }

    const [sonuc] = await db.query(
      "INSERT INTO class_bookings (class_id, member_id, booking_date) VALUES (?, ?, ?)",
      [req.params.id, member_id, booking_date]
    );

    res.status(201).json({
      id: sonuc.insertId,
      remaining_capacity: ders.capacity - sayac[0].adet - 1,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Bu üye derse zaten kayıtlı." });
    }
    console.error(err);
    res.status(500).json({ message: "Rezervasyon yapılamadı." });
  }
});

router.delete("/bookings/:bookingId", async (req, res) => {
  try {
    await db.query("DELETE FROM class_bookings WHERE id = ?", [req.params.bookingId]);
    res.json({ message: "Rezervasyon iptal edildi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rezervasyon iptal edilemedi." });
  }
});

module.exports = router;
