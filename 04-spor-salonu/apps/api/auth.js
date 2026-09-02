const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Kullanıcı adı ve şifre zorunludur." });
  }

  try {
    const [satirlar] = await db.query(
      "SELECT * FROM users WHERE username = ? AND is_active = true",
      [username]
    );

    if (satirlar.length === 0) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const kullanici = satirlar[0];
    if (!bcrypt.compareSync(password, kullanici.password_hash)) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const token = jwt.sign(
      {
        id: kullanici.id,
        username: kullanici.username,
        role: kullanici.role,
        full_name: kullanici.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token: token,
      user: {
        id: kullanici.id,
        full_name: kullanici.full_name,
        username: kullanici.username,
        role: kullanici.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası, giriş yapılamadı." });
  }
});

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Oturum geçersiz, lütfen tekrar giriş yapın." });
  }
  try {
    req.user = jwt.verify(header.substring(7), process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Oturum geçersiz, lütfen tekrar giriş yapın." });
  }
}

// Üye mobil uygulaması girişi — üyeler personel değildir.
// Telefon numarası ve QR kodunun son 4 hanesi ile giriş yapılır.
router.post("/member-login", async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ message: "Telefon ve üye kodu zorunludur." });
  }

  try {
    const [satirlar] = await db.query(
      "SELECT * FROM members WHERE phone = ? AND is_active = true",
      [phone.trim()]
    );

    if (satirlar.length === 0) {
      return res.status(401).json({ message: "Telefon veya üye kodu hatalı." });
    }

    const uye = satirlar[0];
    // QR kodunun son 4 hanesi doğrulama olarak kullanılıyor
    if (uye.qr_code.slice(-4) !== code.trim().toUpperCase()) {
      return res.status(401).json({ message: "Telefon veya üye kodu hatalı." });
    }

    const token = jwt.sign(
      { id: uye.id, role: "uye", full_name: uye.full_name, memberId: uye.id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      token: token,
      member: {
        id: uye.id,
        full_name: uye.full_name,
        phone: uye.phone,
        qr_code: uye.qr_code,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası, giriş yapılamadı." });
  }
});

router.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
});

module.exports = { router, verifyToken };
