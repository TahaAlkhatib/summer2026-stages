const express = require("express");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const CourierTask = require("../models/CourierTask");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const User = require("../models/User");
const { verifyToken } = require("../auth");
const { gunBasi, gunSonu } = require("../tarih");

const router = express.Router();
router.use(verifyToken);

// Durum kodlarının Türkçe karşılıkları
const DURUM_ETIKETLERI = {
  alindi: "Teslim Alındı",
  yikamada: "Yıkamada",
  utude: "Ütüde",
  hazir: "Hazır",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

// Yeni sipariş oluştur
router.post("/", async (req, res) => {
  const { customer_id, delivery_type, promised_date, notes, items } = req.body;

  if (!customer_id) {
    return res.status(400).json({ message: "Müşteri seçilmelidir." });
  }
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Siparişe en az bir hizmet eklenmelidir." });
  }

  const musteri = await Customer.findById(customer_id).catch(() => null);
  if (!musteri) {
    return res.status(400).json({ message: "Müşteri bulunamadı." });
  }

  // Kalemleri önce doğrula, sonra kaydet. Böylece hatalı bir kalem yüzünden
  // yarım sipariş oluşmaz. (MongoDB tek sunucu kurulumunda transaction
  // desteklemediği için doğrulamayı kayıttan önce yapıyoruz.)
  const hazirKalemler = [];
  let toplam = 0;

  for (const kalem of items) {
    const hizmet = await Service.findById(kalem.service_id).catch(() => null);
    if (!hizmet) {
      return res.status(400).json({ message: "Seçilen hizmet bulunamadı." });
    }
    const adet = Number(kalem.quantity);
    if (!adet || adet <= 0) {
      return res.status(400).json({ message: "Miktar sıfırdan büyük olmalıdır." });
    }
    const birimFiyat = Number(hizmet.price);
    const satirToplam = adet * birimFiyat;
    toplam += satirToplam;

    hazirKalemler.push({
      service_id: hizmet._id,
      item_name: kalem.item_name || hizmet.name,
      quantity: adet,
      unit_price: birimFiyat,
      line_total: satirToplam,
      notes: kalem.notes || null,
    });
  }

  let siparis = null;
  try {
    siparis = await Order.create({
      order_no: await Order.yeniNumara(),
      customer_id: musteri._id,
      delivery_type: delivery_type === "kurye" ? "kurye" : "magaza",
      promised_date: promised_date || null,
      notes: notes || null,
      total_amount: toplam,
      created_by: req.user.id,
    });

    const eklenenKalemler = [];
    for (let i = 0; i < hazirKalemler.length; i++) {
      const kalem = await OrderItem.create({
        ...hazirKalemler[i],
        order_id: siparis._id,
        barcode: siparis.order_no + "-" + String(i + 1).padStart(2, "0"),
      });
      eklenenKalemler.push(kalem.toJSON());
    }

    await OrderStatusHistory.create({
      order_id: siparis._id,
      status: "alindi",
      changed_by: req.user.id,
      note: "Sipariş oluşturuldu",
    });

    // Kurye teslimi seçildiyse görev aç
    if (delivery_type === "kurye") {
      const kurye = await User.findOne({ role: "kurye", is_active: true });
      if (kurye) {
        const yarin = new Date();
        yarin.setDate(yarin.getDate() + 1);
        await CourierTask.create({
          order_id: siparis._id,
          courier_id: kurye._id,
          task_type: "teslim",
          address: (musteri.address || "") + " / " + (musteri.district || ""),
          scheduled_at: yarin,
        });
      }
    }

    res.status(201).json({
      id: siparis._id.toString(),
      order_no: siparis.order_no,
      total_amount: toplam,
      items: eklenenKalemler,
    });
  } catch (err) {
    console.error(err);
    // Yarım kalan kayıtları temizle
    if (siparis) {
      await OrderItem.deleteMany({ order_id: siparis._id });
      await OrderStatusHistory.deleteMany({ order_id: siparis._id });
      await CourierTask.deleteMany({ order_id: siparis._id });
      await Order.deleteOne({ _id: siparis._id });
    }
    res.status(500).json({ message: "Sipariş oluşturulamadı." });
  }
});

// Sipariş listesi — durum, arama ve tarih filtreli
router.get("/", async (req, res) => {
  const { status, q, date } = req.query;
  try {
    const filtre = {};
    if (status) filtre.status = status;
    if (date) {
      filtre.created_at = { $gte: gunBasi(date), $lt: gunSonu(date) };
    }

    // Arama hem sipariş numarasında hem müşteri adında yapılıyor.
    // MongoDB'de JOIN olmadığı için önce eşleşen müşterileri buluyoruz.
    if (q) {
      const desen = new RegExp(q, "i");
      const musteriler = await Customer.find({ full_name: desen }).select("_id");
      filtre.$or = [
        { order_no: desen },
        { customer_id: { $in: musteriler.map((m) => m._id) } },
      ];
    }

    const siparisler = await Order.find(filtre)
      .populate("customer_id")
      .sort({ created_at: -1 });

    const cevap = [];
    for (const o of siparisler) {
      const kalemSayisi = await OrderItem.countDocuments({ order_id: o._id });
      cevap.push({
        id: o._id.toString(),
        order_no: o.order_no,
        status: o.status,
        total_amount: o.total_amount,
        paid_amount: o.paid_amount,
        delivery_type: o.delivery_type,
        promised_date: o.promised_date,
        created_at: o.created_at,
        customer_name: o.customer_id ? o.customer_id.full_name : "",
        customer_phone: o.customer_id ? o.customer_id.phone : "",
        item_count: kalemSayisi,
      });
    }

    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Siparişler getirilemedi." });
  }
});

// Barkod ile kalem/sipariş bul (kasa uygulaması barkod okutunca kullanır)
router.get("/barcode/:barcode", async (req, res) => {
  try {
    const kalem = await OrderItem.findOne({ barcode: req.params.barcode.trim() });
    if (!kalem) {
      return res.status(404).json({ message: "Bu barkoda ait kayıt bulunamadı." });
    }

    const siparis = await Order.findById(kalem.order_id).populate("customer_id");
    if (!siparis) {
      return res.status(404).json({ message: "Bu barkoda ait kayıt bulunamadı." });
    }

    res.json({
      order_id: siparis._id.toString(),
      item_name: kalem.item_name,
      quantity: kalem.quantity,
      order_no: siparis.order_no,
      status: siparis.status,
      status_label: DURUM_ETIKETLERI[siparis.status],
      customer_name: siparis.customer_id ? siparis.customer_id.full_name : "",
      customer_phone: siparis.customer_id ? siparis.customer_id.phone : "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Barkod sorgulanamadı." });
  }
});

// Barkod okutup doğrudan aşama güncelle
router.put("/barcode/:barcode/status", async (req, res) => {
  const { status } = req.body;
  if (!DURUM_ETIKETLERI[status]) {
    return res.status(400).json({ message: "Geçersiz sipariş durumu." });
  }

  try {
    const kalem = await OrderItem.findOne({ barcode: req.params.barcode.trim() });
    if (!kalem) {
      return res.status(404).json({ message: "Bu barkoda ait kayıt bulunamadı." });
    }

    const siparis = await Order.findById(kalem.order_id);
    if (!siparis) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }
    if (siparis.status === "teslim_edildi") {
      return res.status(400).json({ message: "Teslim edilmiş sipariş güncellenemez." });
    }

    siparis.status = status;
    if (status === "teslim_edildi") siparis.delivered_at = new Date();
    await siparis.save();

    await OrderStatusHistory.create({
      order_id: siparis._id,
      status: status,
      changed_by: req.user.id,
      note: "Barkod okutularak güncellendi",
    });

    res.json({ id: siparis._id.toString(), order_no: siparis.order_no, status: siparis.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş durumu güncellenemedi." });
  }
});

// Sipariş detayı
router.get("/:id", async (req, res) => {
  try {
    const siparis = await Order.findById(req.params.id).populate("created_by");
    if (!siparis) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    const musteri = await Customer.findById(siparis.customer_id);
    const kalemler = await OrderItem.find({ order_id: siparis._id });
    const gecmis = await OrderStatusHistory.find({ order_id: siparis._id })
      .populate("changed_by")
      .sort({ changed_at: 1 });
    const odemeler = await Payment.find({ order_id: siparis._id }).sort({ created_at: 1 });
    const gorev = await CourierTask.findOne({ order_id: siparis._id }).sort({ _id: -1 });

    const cevap = siparis.toJSON();
    cevap.created_by_name = siparis.created_by ? siparis.created_by.full_name : null;
    cevap.created_by = siparis.created_by ? siparis.created_by._id.toString() : null;
    cevap.customer_id = siparis.customer_id ? siparis.customer_id.toString() : null;
    cevap.status_label = DURUM_ETIKETLERI[siparis.status];
    cevap.customer = musteri ? musteri.toJSON() : null;
    cevap.items = kalemler.map((k) => k.toJSON());
    cevap.history = gecmis.map((h) => {
      const satir = h.toJSON();
      satir.changed_by_name = h.changed_by ? h.changed_by.full_name : null;
      satir.changed_by = h.changed_by ? h.changed_by._id.toString() : null;
      return satir;
    });
    cevap.payments = odemeler.map((o) => o.toJSON());
    cevap.courier_task = gorev ? gorev.toJSON() : null;

    res.json(cevap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş getirilemedi." });
  }
});

// Sipariş aşamasını güncelle
router.put("/:id/status", async (req, res) => {
  const { status, note } = req.body;

  if (!DURUM_ETIKETLERI[status]) {
    return res.status(400).json({ message: "Geçersiz sipariş durumu." });
  }

  try {
    const siparis = await Order.findById(req.params.id);
    if (!siparis) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }
    if (siparis.status === "teslim_edildi") {
      return res.status(400).json({ message: "Teslim edilmiş sipariş güncellenemez." });
    }

    siparis.status = status;
    if (status === "teslim_edildi") siparis.delivered_at = new Date();
    await siparis.save();

    await OrderStatusHistory.create({
      order_id: siparis._id,
      status: status,
      changed_by: req.user.id,
      note: note || null,
    });

    res.json({ id: siparis._id.toString(), order_no: siparis.order_no, status: siparis.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sipariş durumu güncellenemedi." });
  }
});

module.exports = router;
