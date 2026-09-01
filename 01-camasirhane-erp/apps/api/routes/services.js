const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Hizmet listesi
router.get("/", async (req, res) => {
  try {
    let sql = "SELECT * FROM services";
    if (req.query.active === "1") {
      sql += " WHERE is_active = true";
    }
    sql += " ORDER BY category, name";

    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hizmetler getirilemedi." });
  }
});

// Yeni hizmet
router.post("/", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { name, category, unit, price } = req.body;

  if (!name || !category || !unit || !price) {
    return res.status(400).json({ message: "Hizmet adı, kategori, birim ve fiyat zorunludur." });
  }
  const fiyat = Number(price);
  if (!fiyat || fiyat <= 0) {
    return res.status(400).json({ message: "Fiyat sıfırdan büyük olmalıdır." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO services (name, category, unit, price) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, category, unit, fiyat]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hizmet kaydedilemedi." });
  }
});

// Hizmet güncelle
router.put("/:id", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { name, category, unit, price, is_active } = req.body;

  if (!name || !category || !unit || !price) {
    return res.status(400).json({ message: "Hizmet adı, kategori, birim ve fiyat zorunludur." });
  }
  const fiyat = Number(price);
  if (!fiyat || fiyat <= 0) {
    return res.status(400).json({ message: "Fiyat sıfırdan büyük olmalıdır." });
  }

  try {
    const result = await pool.query(
      `UPDATE services SET name = $1, category = $2, unit = $3, price = $4, is_active = $5
       WHERE id = $6 RETURNING *`,
      [name, category, unit, fiyat, is_active === undefined ? true : is_active, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hizmet bulunamadı." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hizmet güncellenemedi." });
  }
});

module.exports = router;
