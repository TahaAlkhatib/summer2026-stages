const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const router = express.Router();

// Giriş
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Kullanıcı adı ve şifre zorunludur." });
  }

  try {
    const user = await User.findOne({ username: username, is_active: true });

    if (!user) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı." });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token: token,
      user: {
        id: user._id.toString(),
        full_name: user.full_name,
        username: user.username,
        role: user.role,
      },
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
