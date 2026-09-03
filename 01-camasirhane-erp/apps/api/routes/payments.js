const express = require("express");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

router.post("/", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer" && req.user.role !== "kurye") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  const { order_id, amount, method } = req.body;
  const tutar = Number(amount);

  if (!order_id || !tutar || tutar <= 0) {
    return res.status(400).json({ message: "Tutar sıfırdan büyük olmalıdır." });
  }
  if (!["nakit", "kart", "havale"].includes(method)) {
    return res.status(400).json({ message: "Ödeme yöntemi nakit, kart veya havale olmalıdır." });
  }

  try {
    const siparis = await Order.findById(order_id).catch(() => null);
    if (!siparis) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    const kalan = Number(siparis.total_amount) - Number(siparis.paid_amount);
    if (tutar > kalan) {
      return res.status(400).json({
        message: "Ödeme tutarı kalan borçtan fazla olamaz. Kalan: " + kalan.toFixed(2) + " ₺",
      });
    }

    const odeme = await Payment.create({
      order_id: siparis._id,
      amount: tutar,
      method: method,
      received_by: req.user.id,
    });

    // Ödenen tutarı ödemelerin toplamından yeniden hesaplıyoruz
    const odemeler = await Payment.find({ order_id: siparis._id });
    let odenen = 0;
    odemeler.forEach((o) => (odenen += Number(o.amount)));

    siparis.paid_amount = odenen;
    await siparis.save();

    res.status(201).json({
      payment: odeme.toJSON(),
      order: {
        id: siparis._id.toString(),
        total_amount: Number(siparis.total_amount),
        paid_amount: odenen,
        remaining: Number(siparis.total_amount) - odenen,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ödeme kaydedilemedi." });
  }
});

module.exports = router;
