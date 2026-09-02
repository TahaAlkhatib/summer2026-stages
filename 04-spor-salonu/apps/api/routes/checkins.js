const express = require("express");
const db = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Turnike okutma — sistemin kalbi.
// QR kodu veya RFID kartı okutulduğunda üyeliğin geçerli olup olmadığı kontrol edilir.
// Reddedilen girişler de sebebiyle birlikte kaydedilir.
router.post("/scan", async (req, res) => {
  const { code, method, gateId } = req.body;

  if (!code || code.trim() === "") {
    return res.status(400).json({ message: "Kart veya QR kodu okunamadı." });
  }

  const okutmaYontemi = method === "rfid" ? "rfid" : (method === "manuel" ? "manuel" : "qr");
  const kod = code.trim().toUpperCase();

  try {
    // Üyeyi QR kodundan veya RFID kartından bul
    const [uyeler] = await db.query(
      "SELECT * FROM members WHERE qr_code = ? OR rfid_card = ?",
      [kod, kod]
    );

    if (uyeler.length === 0) {
      await girisKaydet(null, null, gateId, okutmaYontemi, "red", "Kart tanınmadı.", kod);
      return res.json({
        allowed: false,
        reason: "Kart tanınmadı.",
        member: null,
      });
    }

    const uye = uyeler[0];

    if (!uye.is_active) {
      await girisKaydet(uye.id, null, gateId, okutmaYontemi, "red", "Üyelik dondurulmuş.", kod);
      return res.json({
        allowed: false,
        reason: "Üyelik dondurulmuş.",
        member: { id: uye.id, full_name: uye.full_name },
      });
    }

    // Üyenin en güncel üyeliğini al. Durum filtresi UYGULANMIYOR:
    // süresi dolmuş / seansı bitmiş üyelikte de üyeye net bir sebep söylenebilsin.
    const [uyelikler] = await db.query(
      `SELECT m.*, p.name AS package_name, p.session_count AS package_sessions
       FROM memberships m
       JOIN packages p ON p.id = m.package_id
       WHERE m.member_id = ? AND m.status <> 'iptal'
       ORDER BY m.end_date DESC`,
      [uye.id]
    );

    if (uyelikler.length === 0) {
      await girisKaydet(uye.id, null, gateId, okutmaYontemi, "red", "Üyelik kaydı bulunamadı.", kod);
      return res.json({
        allowed: false,
        reason: "Üyelik kaydı bulunamadı. Lütfen resepsiyona başvurun.",
        member: { id: uye.id, full_name: uye.full_name },
      });
    }

    // Geçerli (tarihi uygun) bir üyelik varsa onu, yoksa en son üyeliği değerlendir
    const bugunTarih = yerelTarih();
    const uyelik = uyelikler.find(
      (u) => u.start_date <= bugunTarih && u.end_date >= bugunTarih
    ) || uyelikler[0];
    const bugun = yerelTarih();

    // Süresi dolmuş mu
    if (uyelik.end_date < bugun) {
      await db.query("UPDATE memberships SET status = 'bitti' WHERE id = ?", [uyelik.id]);
      await girisKaydet(uye.id, uyelik.id, gateId, okutmaYontemi, "red",
        "Üyelik süresi dolmuş (" + uyelik.end_date + ").", kod);
      return res.json({
        allowed: false,
        reason: "Üyelik süresi dolmuş (" + tarihTR(uyelik.end_date) + ").",
        member: { id: uye.id, full_name: uye.full_name },
        membership: { package_name: uyelik.package_name, end_date: uyelik.end_date },
      });
    }

    // Henüz başlamamış mı
    if (uyelik.start_date > bugunTarih) {
      await girisKaydet(uye.id, uyelik.id, gateId, okutmaYontemi, "red",
        "Üyelik " + uyelik.start_date + " tarihinde başlıyor.", kod);
      return res.json({
        allowed: false,
        reason: "Üyelik " + tarihTR(uyelik.start_date) + " tarihinde başlıyor.",
        member: { id: uye.id, full_name: uye.full_name },
      });
    }

    // Seans hakkı bitmiş mi (sınırsız paketlerde remaining_sessions NULL'dur)
    if (uyelik.remaining_sessions !== null && uyelik.remaining_sessions <= 0) {
      await girisKaydet(uye.id, uyelik.id, gateId, okutmaYontemi, "red", "Seans hakkı bitmiş.", kod);
      return res.json({
        allowed: false,
        reason: "Seans hakkı bitmiş.",
        member: { id: uye.id, full_name: uye.full_name },
        membership: { package_name: uyelik.package_name, remaining_sessions: 0 },
      });
    }

    // Aynı gün ikinci kez giriş yapılmışsa seans düşülmez
    const [bugunkuGirisler] = await db.query(
      `SELECT COUNT(*) AS adet FROM checkins
       WHERE member_id = ? AND result = 'izin' AND DATE(created_at) = CURDATE()`,
      [uye.id]
    );
    const bugunIlkGiris = bugunkuGirisler[0].adet === 0;

    let kalanSeans = uyelik.remaining_sessions;
    if (uyelik.remaining_sessions !== null && bugunIlkGiris) {
      kalanSeans = uyelik.remaining_sessions - 1;
      await db.query("UPDATE memberships SET remaining_sessions = ? WHERE id = ?",
        [kalanSeans, uyelik.id]);
    }

    await girisKaydet(uye.id, uyelik.id, gateId, okutmaYontemi, "izin", null, kod);

    res.json({
      allowed: true,
      reason: null,
      member: {
        id: uye.id,
        full_name: uye.full_name,
        phone: uye.phone,
        qr_code: uye.qr_code,
      },
      membership: {
        package_name: uyelik.package_name,
        end_date: uyelik.end_date,
        remaining_sessions: kalanSeans,
        unlimited: uyelik.remaining_sessions === null,
      },
      first_entry_today: bugunIlkGiris,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Turnike sorgusu yapılamadı." });
  }
});

// Giriş kayıtları — turnike ekranındaki canlı log
router.get("/", async (req, res) => {
  const { date, result, memberId } = req.query;
  try {
    let sql = `SELECT c.*, u.full_name AS member_name, u.phone AS member_phone,
                      g.name AS gate_name
               FROM checkins c
               LEFT JOIN members u ON u.id = c.member_id
               LEFT JOIN gates g ON g.id = c.gate_id
               WHERE 1 = 1`;
    const params = [];

    if (date) {
      sql += " AND DATE(c.created_at) = ?";
      params.push(date);
    }
    if (result) {
      sql += " AND c.result = ?";
      params.push(result);
    }
    if (memberId) {
      sql += " AND c.member_id = ?";
      params.push(memberId);
    }
    sql += " ORDER BY c.created_at DESC LIMIT 200";

    const [satirlar] = await db.query(sql, params);
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Giriş kayıtları getirilemedi." });
  }
});

// Turnike cihazları
router.get("/gates", async (req, res) => {
  try {
    const [satirlar] = await db.query("SELECT * FROM gates ORDER BY name");
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Turnikeler getirilemedi." });
  }
});

async function girisKaydet(uyeId, uyelikId, kapiId, yontem, sonuc, sebep, kod) {
  await db.query(
    `INSERT INTO checkins (member_id, membership_id, gate_id, method, result, reject_reason, scanned_code)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uyeId, uyelikId, kapiId || null, yontem, sonuc, sebep, kod]
  );
}

// Yerel tarih (UTC değil) — YYYY-AA-GG
function yerelTarih() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function tarihTR(isoTarih) {
  if (!isoTarih) return "-";
  const p = String(isoTarih).slice(0, 10).split("-");
  return p[2] + "." + p[1] + "." + p[0];
}

module.exports = router;
