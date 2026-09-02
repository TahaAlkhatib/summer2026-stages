const express = require("express");
const db = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Üye listesi / arama (ad, telefon veya QR kodu)
router.get("/", async (req, res) => {
  const q = req.query.q || "";
  try {
    const [satirlar] = await db.query(
      `SELECT u.*,
              (SELECT COUNT(*) FROM memberships m
               WHERE m.member_id = u.id AND m.status = 'aktif' AND m.end_date >= CURDATE()) AS active_membership,
              (SELECT m2.end_date FROM memberships m2
               WHERE m2.member_id = u.id AND m2.status = 'aktif'
               ORDER BY m2.end_date DESC LIMIT 1) AS end_date,
              (SELECT m3.remaining_sessions FROM memberships m3
               WHERE m3.member_id = u.id AND m3.status = 'aktif'
               ORDER BY m3.end_date DESC LIMIT 1) AS remaining_sessions
       FROM members u
       WHERE u.full_name LIKE ? OR u.phone LIKE ? OR u.qr_code LIKE ?
       ORDER BY u.full_name`,
      ["%" + q + "%", "%" + q + "%", "%" + q + "%"]
    );
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Üyeler getirilemedi." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [uyeler] = await db.query("SELECT * FROM members WHERE id = ?", [req.params.id]);
    if (uyeler.length === 0) {
      return res.status(404).json({ message: "Üye bulunamadı." });
    }

    const [uyelikler] = await db.query(
      `SELECT m.*, p.name AS package_name, p.duration_days
       FROM memberships m JOIN packages p ON p.id = m.package_id
       WHERE m.member_id = ? ORDER BY m.start_date DESC`,
      [req.params.id]
    );

    const [girisler] = await db.query(
      `SELECT c.*, g.name AS gate_name FROM checkins c
       LEFT JOIN gates g ON g.id = c.gate_id
       WHERE c.member_id = ? ORDER BY c.created_at DESC LIMIT 20`,
      [req.params.id]
    );

    const cevap = uyeler[0];
    cevap.memberships = uyelikler;
    cevap.recent_checkins = girisler;
    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Üye getirilemedi." });
  }
});

// Yeni üye — QR kodu otomatik üretilir
router.post("/", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  const { full_name, phone, email, birth_date, gender, rfid_card, notes } = req.body;
  if (!full_name || !phone) {
    return res.status(400).json({ message: "Ad soyad ve telefon zorunludur." });
  }

  try {
    // QR kodu: UYE-2026-00001 biçiminde
    const yil = new Date().getFullYear();
    const [sayac] = await db.query(
      "SELECT COUNT(*) AS adet FROM members WHERE qr_code LIKE ?",
      ["UYE-" + yil + "-%"]
    );
    const qrKodu = "UYE-" + yil + "-" + String(sayac[0].adet + 1).padStart(5, "0");

    const [sonuc] = await db.query(
      `INSERT INTO members (full_name, phone, email, birth_date, gender, qr_code, rfid_card, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, phone, email || null, birth_date || null, gender || null,
       qrKodu, rfid_card || null, notes || null]
    );

    res.status(201).json({ id: sonuc.insertId, full_name, phone, qr_code: qrKodu });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Bu RFID kartı zaten başka bir üyeye tanımlı." });
    }
    res.status(500).json({ message: "Üye kaydedilemedi." });
  }
});

router.put("/:id", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { full_name, phone, email, birth_date, gender, rfid_card, notes, is_active } = req.body;
  if (!full_name || !phone) {
    return res.status(400).json({ message: "Ad soyad ve telefon zorunludur." });
  }

  try {
    await db.query(
      `UPDATE members SET full_name = ?, phone = ?, email = ?, birth_date = ?,
              gender = ?, rfid_card = ?, notes = ?, is_active = ?
       WHERE id = ?`,
      [full_name, phone, email || null, birth_date || null, gender || null,
       rfid_card || null, notes || null,
       is_active === undefined ? true : is_active, req.params.id]
    );
    res.json({ id: Number(req.params.id), full_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Üye güncellenemedi." });
  }
});

// Üyeye paket sat — üyelik oluşturur
router.post("/:id/memberships", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  const { package_id, start_date, paid_amount, method } = req.body;

  try {
    const [uyeler] = await db.query("SELECT * FROM members WHERE id = ?", [req.params.id]);
    if (uyeler.length === 0) {
      return res.status(404).json({ message: "Üye bulunamadı." });
    }

    const [paketler] = await db.query("SELECT * FROM packages WHERE id = ?", [package_id]);
    if (paketler.length === 0) {
      return res.status(400).json({ message: "Paket bulunamadı." });
    }
    const paket = paketler[0];

    const baslangic = start_date || yerelTarih();
    const bitis = tarihEkle(baslangic, paket.duration_days);

    const [sonuc] = await db.query(
      `INSERT INTO memberships (member_id, package_id, start_date, end_date,
                                remaining_sessions, total_price, paid_amount, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, paket.id, baslangic, bitis, paket.session_count,
       paket.price, 0, req.user.id]
    );

    const uyelikId = sonuc.insertId;

    // Peşin ödeme alındıysa kaydet
    const odenen = Number(paid_amount) || 0;
    if (odenen > 0) {
      if (odenen > Number(paket.price)) {
        return res.status(400).json({ message: "Ödeme tutarı paket fiyatından fazla olamaz." });
      }
      await db.query(
        "INSERT INTO payments (membership_id, amount, method, received_by) VALUES (?, ?, ?, ?)",
        [uyelikId, odenen, method || "nakit", req.user.id]
      );
      await db.query("UPDATE memberships SET paid_amount = ? WHERE id = ?", [odenen, uyelikId]);
    }

    res.status(201).json({
      id: uyelikId,
      package_name: paket.name,
      start_date: baslangic,
      end_date: bitis,
      remaining_sessions: paket.session_count,
      total_price: Number(paket.price),
      paid_amount: odenen,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Üyelik oluşturulamadı." });
  }
});

// Üyelik borcuna tahsilat
router.post("/memberships/:membershipId/payments", async (req, res) => {
  const { amount, method } = req.body;
  const tutar = Number(amount);

  if (!tutar || tutar <= 0) {
    return res.status(400).json({ message: "Tutar sıfırdan büyük olmalıdır." });
  }
  if (!["nakit", "kart", "havale"].includes(method)) {
    return res.status(400).json({ message: "Ödeme yöntemi nakit, kart veya havale olmalıdır." });
  }

  try {
    const [uyelikler] = await db.query("SELECT * FROM memberships WHERE id = ?",
      [req.params.membershipId]);
    if (uyelikler.length === 0) {
      return res.status(404).json({ message: "Üyelik bulunamadı." });
    }

    const uyelik = uyelikler[0];
    const kalan = Number(uyelik.total_price) - Number(uyelik.paid_amount);
    if (tutar > kalan) {
      return res.status(400).json({
        message: "Ödeme tutarı kalan borçtan fazla olamaz. Kalan: " + kalan.toFixed(2) + " ₺",
      });
    }

    await db.query(
      "INSERT INTO payments (membership_id, amount, method, received_by) VALUES (?, ?, ?, ?)",
      [uyelik.id, tutar, method, req.user.id]
    );

    const [toplam] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS odenen FROM payments WHERE membership_id = ?",
      [uyelik.id]
    );
    await db.query("UPDATE memberships SET paid_amount = ? WHERE id = ?",
      [toplam[0].odenen, uyelik.id]);

    res.status(201).json({
      membership_id: uyelik.id,
      total_price: Number(uyelik.total_price),
      paid_amount: Number(toplam[0].odenen),
      remaining: Number(uyelik.total_price) - Number(toplam[0].odenen),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ödeme kaydedilemedi." });
  }
});

function yerelTarih() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function tarihEkle(tarih, gun) {
  const d = new Date(tarih + "T00:00:00");
  d.setDate(d.getDate() + gun);
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

module.exports = router;
