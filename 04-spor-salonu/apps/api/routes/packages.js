const express = require("express");
const db = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

router.get("/", async (req, res) => {
  try {
    let sql = "SELECT * FROM packages";
    if (req.query.active === "1") {
      sql += " WHERE is_active = true";
    }
    sql += " ORDER BY price";
    const [satirlar] = await db.query(sql);
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Paketler getirilemedi." });
  }
});

router.post("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { name, duration_days, session_count, price } = req.body;

  if (!name || !duration_days || !price) {
    return res.status(400).json({ message: "Paket adı, süre ve fiyat zorunludur." });
  }
  if (Number(price) <= 0) {
    return res.status(400).json({ message: "Fiyat sıfırdan büyük olmalıdır." });
  }
  if (Number(duration_days) <= 0) {
    return res.status(400).json({ message: "Süre sıfırdan büyük olmalıdır." });
  }

  try {
    const [sonuc] = await db.query(
      "INSERT INTO packages (name, duration_days, session_count, price) VALUES (?, ?, ?, ?)",
      [name, duration_days, session_count || null, price]
    );
    res.status(201).json({ id: sonuc.insertId, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Paket kaydedilemedi." });
  }
});

router.put("/:id", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { name, duration_days, session_count, price, is_active } = req.body;
  try {
    await db.query(
      `UPDATE packages SET name = ?, duration_days = ?, session_count = ?, price = ?, is_active = ?
       WHERE id = ?`,
      [name, duration_days, session_count || null, price,
       is_active === undefined ? true : is_active, req.params.id]
    );
    res.json({ id: Number(req.params.id), name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Paket güncellenemedi." });
  }
});

module.exports = router;
