const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const router = express.Router();

// Giriş
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Kullanıcı adı ve şifre zorunludur." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND is_active = true",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const user = result.rows[0];
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token: token,
      user: { id: user.id, full_name: user.full_name, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası, giriş yapılamadı." });
  }
});

// Token doğrulama ara katmanı
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

// Giriş yapan kullanıcının bilgisi
router.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
});

module.exports = { router, verifyToken };
