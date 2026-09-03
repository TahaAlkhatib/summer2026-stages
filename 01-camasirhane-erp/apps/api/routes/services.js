const express = require("express");
const Service = require("../models/Service");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Hizmet listesi
router.get("/", async (req, res) => {
  try {
    const filtre = req.query.active === "1" ? { is_active: true } : {};
    const hizmetler = await Service.find(filtre).sort({ category: 1, name: 1 });
    res.json(hizmetler);
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
    const hizmet = await Service.create({ name, category, unit, price: fiyat });
    res.status(201).json(hizmet);
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
    const hizmet = await Service.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        unit,
        price: fiyat,
        is_active: is_active === undefined ? true : is_active,
      },
      { new: true }
    ).catch(() => null);

    if (!hizmet) {
      return res.status(404).json({ message: "Hizmet bulunamadı." });
    }
    res.json(hizmet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hizmet güncellenemedi." });
  }
});

module.exports = router;
