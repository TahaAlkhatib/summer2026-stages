const express = require("express");
const CourierTask = require("../models/CourierTask");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

const GOREV_ETIKETLERI = { alma: "Alma", teslim: "Teslim" };

// Kurye görev listesi
router.get("/tasks", async (req, res) => {
  try {
    const filtre = {};
    // Kurye sadece kendi görevlerini görür
    if (req.user.role === "kurye") {
      filtre.courier_id = req.user.id;
    }
    if (req.query.status) {
      filtre.status = req.query.status;
    }

    const gorevler = await CourierTask.find(filtre).sort({ scheduled_at: 1 });

    const cevap = [];
    for (const g of gorevler) {
      const siparis = await Order.findById(g.order_id);
      const musteri = siparis ? await Customer.findById(siparis.customer_id) : null;

      const satir = g.toJSON();
      satir.order_id = g.order_id ? g.order_id.toString() : null;
      satir.courier_id = g.courier_id ? g.courier_id.toString() : null;
      satir.task_type_label = GOREV_ETIKETLERI[g.task_type];
      satir.order_no = siparis ? siparis.order_no : "";
      satir.total_amount = siparis ? siparis.total_amount : 0;
      satir.paid_amount = siparis ? siparis.paid_amount : 0;
      satir.customer_name = musteri ? musteri.full_name : "";
      satir.customer_phone = musteri ? musteri.phone : "";
      cevap.push(satir);
    }

    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Görevler getirilemedi." });
  }
});

// Görev durumunu güncelle
router.put("/tasks/:id/status", async (req, res) => {
  const { status, note } = req.body;
  if (!["bekliyor", "yolda", "tamamlandi", "basarisiz"].includes(status)) {
    return res.status(400).json({ message: "Geçersiz görev durumu." });
  }

  try {
    const gorev = await CourierTask.findById(req.params.id).catch(() => null);
    if (!gorev) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }
    if (req.user.role === "kurye" && gorev.courier_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu görev size ait değil." });
    }

    gorev.status = status;
    if (note) gorev.note = note;
    if (status === "tamamlandi") gorev.completed_at = new Date();
    await gorev.save();

    // Teslim görevi tamamlandıysa siparişi de teslim edildi yap
    if (status === "tamamlandi" && gorev.task_type === "teslim") {
      await Order.findByIdAndUpdate(gorev.order_id, {
        status: "teslim_edildi",
        delivered_at: new Date(),
      });
      await OrderStatusHistory.create({
        order_id: gorev.order_id,
        status: "teslim_edildi",
        changed_by: req.user.id,
        note: "Kurye teslim etti",
      });
    }

    const cevap = gorev.toJSON();
    cevap.order_id = gorev.order_id.toString();
    cevap.courier_id = gorev.courier_id.toString();
    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Görev güncellenemedi." });
  }
});

module.exports = router;
