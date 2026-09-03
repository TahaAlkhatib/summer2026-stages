const express = require("express");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Müşteri listesi / arama
router.get("/", async (req, res) => {
  const q = req.query.q || "";
  try {
    // Büyük/küçük harf duyarsız arama için
    // düzenli ifade (regex) kullanıyoruz.
    const filtre = q
      ? {
          $or: [
            { full_name: new RegExp(q, "i") },
            { phone: new RegExp(q, "i") },
            { district: new RegExp(q, "i") },
          ],
        }
      : {};

    const musteriler = await Customer.find(filtre).sort({ full_name: 1 });

    const cevap = [];
    for (const m of musteriler) {
      const satir = m.toJSON();
      satir.order_count = await Order.countDocuments({ customer_id: m._id });
      cevap.push(satir);
    }

    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteriler getirilemedi." });
  }
});

// Müşteri detayı + siparişleri
router.get("/:id", async (req, res) => {
  try {
    const musteri = await Customer.findById(req.params.id).catch(() => null);
    if (!musteri) {
      return res.status(404).json({ message: "Müşteri bulunamadı." });
    }

    const siparisler = await Order.find({ customer_id: musteri._id })
      .select("order_no status total_amount created_at")
      .sort({ created_at: -1 });

    const cevap = musteri.toJSON();
    cevap.orders = siparisler.map((o) => o.toJSON());
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
    const musteri = await Customer.create({
      full_name,
      phone,
      address: address || null,
      district: district || null,
      notes: notes || null,
    });
    res.status(201).json(musteri);
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
    const musteri = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        full_name,
        phone,
        address: address || null,
        district: district || null,
        notes: notes || null,
      },
      { new: true }
    ).catch(() => null);

    if (!musteri) {
      return res.status(404).json({ message: "Müşteri bulunamadı." });
    }
    res.json(musteri);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Müşteri güncellenemedi." });
  }
});

module.exports = router;
