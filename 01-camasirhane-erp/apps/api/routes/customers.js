const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Müşteri listesi / arama
router.get("/", async (req, res) => {
  const q = req.query.q || "";
  try {
    const result = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
       FROM customers c
       WHERE c.full_name ILIKE $1 OR c.phone ILIKE $1 OR c.district ILIKE $1
       ORDER BY c.full_name`,
      ["%" + q + "%"]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteriler getirilemedi." });
  }
});

// Müşteri detayı + siparişleri
router.get("/:id", async (req, res) => {
  try {
    const musteri = await pool.query("SELECT * FROM customers WHERE id = $1", [req.params.id]);
    if (musteri.rows.length === 0) {
      return res.status(404).json({ message: "Müşteri bulunamadı." });
    }
    const siparisler = await pool.query(
      `SELECT id, order_no, status, total_amount, created_at
       FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    const cevap = musteri.rows[0];
    cevap.orders = siparisler.rows;
    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteri getirilemedi." });
  }
});

// Yeni müşteri
router.post("/", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { full_name, phone, address, district, notes } = req.body;
  if (!full_name || !phone) {
    return res.status(400).json({ message: "Ad soyad ve telefon zorunludur." });
  }
  try {
    const result = await pool.query(
      `INSERT INTO customers (full_name, phone, address, district, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [full_name, phone, address || null, district || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteri kaydedilemedi." });
  }
});

// Müşteri güncelle
router.put("/:id", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { full_name, phone, address, district, notes } = req.body;
  if (!full_name || !phone) {
    return res.status(400).json({ message: "Ad soyad ve telefon zorunludur." });
  }
  try {
    const result = await pool.query(
      `UPDATE customers SET full_name = $1, phone = $2, address = $3, district = $4, notes = $5
       WHERE id = $6 RETURNING *`,
      [full_name, phone, address || null, district || null, notes || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Müşteri bulunamadı." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteri güncellenemedi." });
  }
});

module.exports = router;
