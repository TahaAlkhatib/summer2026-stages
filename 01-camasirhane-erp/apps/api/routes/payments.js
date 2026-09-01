const express = require("express");
const pool = require("../db");
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
    const siparis = await pool.query("SELECT total_amount, paid_amount FROM orders WHERE id = $1", [order_id]);
    if (siparis.rows.length === 0) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    const kalan = Number(siparis.rows[0].total_amount) - Number(siparis.rows[0].paid_amount);
    if (tutar > kalan) {
      return res.status(400).json({ message: "Ödeme tutarı kalan borçtan fazla olamaz. Kalan: " + kalan.toFixed(2) + " ₺" });
    }

    const odeme = await pool.query(
      "INSERT INTO payments (order_id, amount, method, received_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [order_id, tutar, method, req.user.id]
    );

    const guncel = await pool.query(
      `UPDATE orders
       SET paid_amount = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = $1)
       WHERE id = $1 RETURNING id, total_amount, paid_amount`,
      [order_id]
    );

    const o = guncel.rows[0];
    res.status(201).json({
      payment: odeme.rows[0],
      order: {
        id: o.id,
        total_amount: Number(o.total_amount),
        paid_amount: Number(o.paid_amount),
        remaining: Number(o.total_amount) - Number(o.paid_amount),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ödeme kaydedilemedi." });
  }
});

module.exports = router;
