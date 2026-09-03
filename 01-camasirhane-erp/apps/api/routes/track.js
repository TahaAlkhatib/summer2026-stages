// Müşteri takip ucu — giriş gerektirmez, sipariş no veya barkod ile sorgulanır
const express = require("express");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const Customer = require("../models/Customer");

const router = express.Router();

const DURUM_ETIKETLERI = {
  alindi: "Teslim Alındı",
  yikamada: "Yıkamada",
  utude: "Ütüde",
  hazir: "Hazır",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

router.get("/:code", async (req, res) => {
  const kod = req.params.code.trim();
  try {
    // Hem sipariş numarası hem barkod kabul edilir
    let siparis = await Order.findOne({ order_no: kod });

    if (!siparis) {
      const kalem = await OrderItem.findOne({ barcode: kod });
      if (kalem) {
        siparis = await Order.findById(kalem.order_id);
      }
    }

    if (!siparis) {
      return res.status(404).json({ message: "Sipariş bulunamadı. Lütfen numarayı kontrol edin." });
    }

    const musteri = await Customer.findById(siparis.customer_id);
    const kalemSayisi = await OrderItem.countDocuments({ order_id: siparis._id });
    const gecmis = await OrderStatusHistory.find({ order_id: siparis._id }).sort({ changed_at: 1 });

    res.json({
      order_no: siparis.order_no,
      status: siparis.status,
      status_label: DURUM_ETIKETLERI[siparis.status],
      promised_date: siparis.promised_date,
      created_at: siparis.created_at,
      customer_name: musteri ? musteri.full_name : "",
      item_count: kalemSayisi,
      history: gecmis.map((s) => ({
        status: s.status,
        status_label: DURUM_ETIKETLERI[s.status],
        changed_at: s.changed_at,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş sorgulanamadı." });
  }
});

module.exports = router;
