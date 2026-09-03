// Türkçe demo verisi yükler. Çalıştırma: npm run seed
const bcrypt = require("bcryptjs");
const { mongoose, baglan } = require("../db");

const User = require("../models/User");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const OrderStatusHistory = require("../models/OrderStatusHistory");
const CourierTask = require("../models/CourierTask");
const Payment = require("../models/Payment");

async function seed() {
  await baglan();
  console.log("Demo verisi yükleniyor...");

  // Önce mevcut veriyi temizle
  await Promise.all([
    Payment.deleteMany({}),
    CourierTask.deleteMany({}),
    OrderStatusHistory.deleteMany({}),
    OrderItem.deleteMany({}),
    Order.deleteMany({}),
    Service.deleteMany({}),
    Customer.deleteMany({}),
    User.deleteMany({}),
  ]);

  const sifre = bcrypt.hashSync("123456", 10);

  // Personel
  const kullanicilar = await User.insertMany([
    { full_name: "Ahmet Yılmaz",  username: "admin",    password_hash: sifre, role: "admin",   phone: "+90 532 111 22 33" },
    { full_name: "Zeynep Kaya",   username: "kasiyer1", password_hash: sifre, role: "kasiyer", phone: "+90 533 222 33 44" },
    { full_name: "Mustafa Demir", username: "kurye1",   password_hash: sifre, role: "kurye",   phone: "+90 534 333 44 55" },
  ]);
  const kasiyer = kullanicilar[1];
  const kurye = kullanicilar[2];

  // Hizmetler ve fiyatlar
  const hizmetler = await Service.insertMany([
    { name: "Gömlek Yıkama + Ütü",          category: "yikama",         unit: "adet", price: 45 },
    { name: "Takım Elbise Kuru Temizleme",  category: "kuru_temizleme", unit: "adet", price: 250 },
    { name: "Palto / Kaban Kuru Temizleme", category: "kuru_temizleme", unit: "adet", price: 320 },
    { name: "Gelinlik Kuru Temizleme",      category: "kuru_temizleme", unit: "adet", price: 900 },
    { name: "Battaniye Yıkama",             category: "yikama",         unit: "adet", price: 180 },
    { name: "Perde Yıkama",                 category: "yikama",         unit: "kg",   price: 90 },
    { name: "Halı Yıkama",                  category: "yikama",         unit: "m2",   price: 120 },
    { name: "Leke Çıkarma (Özel İşlem)",    category: "leke",           unit: "adet", price: 75 },
  ]);

  // Müşteriler
  const musteriler = await Customer.insertMany([
    { full_name: "Elif Şahin",   phone: "+90 535 401 11 21", address: "Bağdat Cad. No:112 D:5",    district: "Kadıköy" },
    { full_name: "Burak Aydın",  phone: "+90 536 402 12 22", address: "Barbaros Bulvarı No:38",    district: "Beşiktaş" },
    { full_name: "Merve Doğan",  phone: "+90 537 403 13 23", address: "Çamlıca Mah. 12. Sok No:7", district: "Üsküdar" },
    { full_name: "Emre Çelik",   phone: "+90 538 404 14 24", address: "Halaskargazi Cad. No:200",  district: "Şişli" },
    { full_name: "Ayşe Koç",     phone: "+90 539 405 15 25", address: "İncirli Cad. No:45 D:3",    district: "Bakırköy" },
    { full_name: "Kerem Arslan", phone: "+90 505 406 16 26", address: "Nispetiye Cad. No:18",      district: "Beşiktaş" },
    { full_name: "Selin Yıldız", phone: "+90 506 407 17 27", address: "Moda Cad. No:88 D:2",       district: "Kadıköy" },
    { full_name: "Onur Polat",   phone: "+90 507 408 18 28", address: "Atatürk Bulvarı No:15",     district: "Ataşehir" },
    { full_name: "Deniz Kurt",   phone: "+90 508 409 19 29", address: "Bahariye Cad. No:60",       district: "Kadıköy" },
    { full_name: "Hakan Öztürk", phone: "+90 509 410 20 30", address: "Kartaltepe Mah. No:9",      district: "Bakırköy" },
  ]);

  // Siparişler — her durumdan örnek olsun
  const durumlar = ["alindi", "yikamada", "utude", "hazir", "hazir", "teslim_edildi", "teslim_edildi", "alindi"];
  const teslimTipleri = ["magaza", "kurye", "magaza", "kurye", "magaza", "kurye", "magaza", "kurye"];

  for (let i = 0; i < durumlar.length; i++) {
    const orderNo = "SP-2026-" + String(i + 1).padStart(5, "0");
    const musteri = musteriler[i % musteriler.length];
    const durum = durumlar[i];
    const teslimTipi = teslimTipleri[i];

    // Kayıt tarihi geriye doğru dağıtılıyor ki grafikler dolu görünsün
    const kayitTarihi = new Date();
    kayitTarihi.setDate(kayitTarihi.getDate() - (7 - i));

    const sozTarihi = new Date();
    sozTarihi.setDate(sozTarihi.getDate() + 2);

    const siparis = await Order.create({
      order_no: orderNo,
      customer_id: musteri._id,
      status: durum,
      delivery_type: teslimTipi,
      promised_date: sozTarihi,
      courier_id: teslimTipi === "kurye" ? kurye._id : null,
      created_by: kasiyer._id,
      created_at: kayitTarihi,
      delivered_at: durum === "teslim_edildi" ? new Date() : null,
    });

    // Her siparişe 2 kalem ekle
    let toplam = 0;
    for (let j = 0; j < 2; j++) {
      const hizmet = hizmetler[(i + j) % hizmetler.length];
      const adet = j + 1;
      const birimFiyat = Number(hizmet.price);
      const satirToplam = adet * birimFiyat;
      toplam += satirToplam;

      await OrderItem.create({
        order_id: siparis._id,
        service_id: hizmet._id,
        item_name: hizmet.name,
        quantity: adet,
        unit_price: birimFiyat,
        line_total: satirToplam,
        barcode: orderNo + "-" + String(j + 1).padStart(2, "0"),
      });
    }

    siparis.total_amount = toplam;

    // Durum geçmişi
    await OrderStatusHistory.create({
      order_id: siparis._id,
      status: "alindi",
      changed_by: kasiyer._id,
      note: "Sipariş oluşturuldu",
      changed_at: kayitTarihi,
    });
    if (durum !== "alindi") {
      await OrderStatusHistory.create({
        order_id: siparis._id,
        status: durum,
        changed_by: kasiyer._id,
      });
    }

    // Teslim edilenler ödenmiş sayılsın
    if (durum === "teslim_edildi") {
      await Payment.create({
        order_id: siparis._id,
        amount: toplam,
        method: "nakit",
        received_by: kasiyer._id,
      });
      siparis.paid_amount = toplam;
    }

    await siparis.save();

    // Kurye görevleri
    if (teslimTipi === "kurye") {
      const yarin = new Date();
      yarin.setDate(yarin.getDate() + 1);
      await CourierTask.create({
        order_id: siparis._id,
        courier_id: kurye._id,
        task_type: "teslim",
        status: durum === "teslim_edildi" ? "tamamlandi" : "bekliyor",
        address: musteri.address + " / " + musteri.district,
        scheduled_at: yarin,
        completed_at: durum === "teslim_edildi" ? new Date() : null,
      });
    }
  }

  console.log("3 kullanıcı, 8 hizmet, 10 müşteri, 8 sipariş eklendi.");
  console.log("Demo verisi yüklendi. Şifre hepsinde: 123456");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Demo verisi yüklenemedi:", err);
  process.exit(1);
});
