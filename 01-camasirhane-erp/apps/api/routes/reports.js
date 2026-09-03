const express = require("express");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const CourierTask = require("../models/CourierTask");
const Customer = require("../models/Customer");
const { verifyToken } = require("../auth");
const { gunBasi, gunSonu, gunMetni, ayBasi } = require("../tarih");

const router = express.Router();
router.use(verifyToken);

// Gün sonu kasa raporu
router.get("/daily", async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "kasiyer") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  try {
    // Tarih verilmediyse bugünün yerel günü kullanılır.
    // (tarih.js içindeki yardımcılar UTC kaymasını önlüyor.)
    const bas = gunBasi(req.query.date || undefined);
    const bit = gunSonu(req.query.date || undefined);
    const tarih = gunMetni(bas);

    const siparisler = await Order.find({ created_at: { $gte: bas, $lt: bit } })
      .populate("customer_id")
      .sort({ created_at: 1 });

    const odemeler = await Payment.find({ created_at: { $gte: bas, $lt: bit } });

    const teslimSayisi = await Order.countDocuments({
      delivered_at: { $gte: bas, $lt: bit },
    });

    const kasa = { nakit: 0, kart: 0, havale: 0, toplam: 0 };
    odemeler.forEach((o) => {
      kasa[o.method] += Number(o.amount);
      kasa.toplam += Number(o.amount);
    });

    let ciro = 0;
    siparisler.forEach((s) => (ciro += Number(s.total_amount)));

    res.json({
      date: tarih,
      order_count: siparisler.length,
      total_amount: ciro,
      collected: kasa,
      delivered_count: teslimSayisi,
      orders: siparisler.map((s) => ({
        order_no: s.order_no,
        total_amount: s.total_amount,
        paid_amount: s.paid_amount,
        status: s.status,
        customer_name: s.customer_id ? s.customer_id.full_name : "",
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rapor hazırlanamadı." });
  }
});

// Yönetim paneli özeti
router.get("/summary", async (req, res) => {
  try {
    const durumSayilari = {
      alindi: 0, yikamada: 0, utude: 0, hazir: 0, teslim_edildi: 0, iptal: 0,
    };
    for (const durum of Object.keys(durumSayilari)) {
      durumSayilari[durum] = await Order.countDocuments({ status: durum });
    }

    const bugunBas = gunBasi();
    const bugunBit = gunSonu();
    const bugunSiparisler = await Order.find({ created_at: { $gte: bugunBas, $lt: bugunBit } });
    const aySiparisler = await Order.find({ created_at: { $gte: ayBasi() } });

    let bugunCiro = 0;
    bugunSiparisler.forEach((s) => (bugunCiro += Number(s.total_amount)));
    let ayCiro = 0;
    aySiparisler.forEach((s) => (ayCiro += Number(s.total_amount)));

    const bekleyenGorev = await CourierTask.countDocuments({
      status: { $in: ["bekliyor", "yolda"] },
    });

    // Ödenmemiş bakiye: iptal olmayan ve borcu kalan siparişler
    const borcluSiparisler = await Order.find({ status: { $ne: "iptal" } });
    let borc = 0;
    borcluSiparisler.forEach((s) => {
      const kalan = Number(s.total_amount) - Number(s.paid_amount);
      if (kalan > 0) borc += kalan;
    });

    // En çok gelir getiren 5 hizmet.
    // MongoDB'de gruplama "aggregate" ile yapılır.
    const enCokHizmet = await OrderItem.aggregate([
      {
        $group: {
          _id: "$item_name",
          revenue: { $sum: "$line_total" },
          orders: { $addToSet: "$order_id" },
        },
      },
      { $project: { name: "$_id", revenue: 1, order_count: { $size: "$orders" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      status_counts: durumSayilari,
      today: { order_count: bugunSiparisler.length, total_amount: bugunCiro },
      month: { order_count: aySiparisler.length, total_amount: ayCiro },
      pending_courier_tasks: bekleyenGorev,
      unpaid_total: borc,
      top_services: enCokHizmet.map((h) => ({
        name: h.name,
        order_count: h.order_count,
        revenue: h.revenue,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Özet hazırlanamadı." });
  }
});

module.exports = router;
