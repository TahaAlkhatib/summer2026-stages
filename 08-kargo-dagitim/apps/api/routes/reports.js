const express = require('express');
const Shipment = require('../models/Shipment');
const CodCollection = require('../models/CodCollection');
const Branch = require('../models/Branch');
const Merchant = require('../models/Merchant');
const User = require('../models/User');
const { girisGerekli } = require('../auth');
const { yerelGun, gunBasi, gunSonu, ayBasi } = require('../yardimcilar');

const router = express.Router();
router.use(girisGerekli);

const TUM_DURUMLAR = [
  'olusturuldu', 'subede', 'dagitimda',
  'teslim_edildi', 'teslim_edilemedi', 'iade',
];

router.get('/summary', async (req, res) => {
  // Tacir kullanıcıları sadece kendi rakamlarını görür
  const temel = req.kullanici.role === 'tacir'
    ? { merchant_id: req.kullanici.merchantId }
    : {};

  const sayilar = {};
  for (const durum of TUM_DURUMLAR) {
    sayilar[durum] = await Shipment.countDocuments({ ...temel, status: durum });
  }

  const bugunYeni = await Shipment.countDocuments({
    ...temel,
    created_at: { $gte: gunBasi(), $lt: gunSonu() },
  });
  const bugunTeslim = await Shipment.countDocuments({
    ...temel,
    delivered_at: { $gte: gunBasi(), $lt: gunSonu() },
  });

  // Kapıda ödeme: teslim edilenler tahsil edilmiş, diğerleri bekliyor
  const kapidaOdemeliler = await Shipment.find({ ...temel, cod_amount: { $gt: 0 } })
    .select('cod_amount status');

  let bekleyen = 0;
  let tahsil = 0;
  kapidaOdemeliler.forEach((g) => {
    if (g.status === 'teslim_edildi') tahsil += Number(g.cod_amount);
    else bekleyen += Number(g.cod_amount);
  });

  const ayGonderileri = await Shipment.find({
    ...temel,
    created_at: { $gte: ayBasi() },
  }).select('shipping_fee');

  let ciro = 0;
  ayGonderileri.forEach((g) => (ciro += Number(g.shipping_fee)));

  res.json({
    date: yerelGun(),
    counts: sayilar,
    total: Object.values(sayilar).reduce((t, s) => t + s, 0),
    today_created: bugunYeni,
    today_delivered: bugunTeslim,
    cod_pending: bekleyen,
    cod_collected: tahsil,
    month_shipping_revenue: ciro,
  });
});

// Şube performansı
router.get('/branches', async (req, res) => {
  const subeler = await Branch.find({ is_active: true }).sort({ name: 1 });

  const sonuc = [];
  for (const s of subeler) {
    const toplam = await Shipment.countDocuments({ dest_branch_id: s._id });
    const teslim = await Shipment.countDocuments({ dest_branch_id: s._id, status: 'teslim_edildi' });
    const dagitimda = await Shipment.countDocuments({ dest_branch_id: s._id, status: 'dagitimda' });
    const bekleyen = await Shipment.countDocuments({
      dest_branch_id: s._id,
      status: { $in: ['olusturuldu', 'subede'] },
    });

    sonuc.push({
      id: s._id.toString(),
      code: s.code,
      name: s.name,
      toplam: toplam,
      teslim: teslim,
      dagitimda: dagitimda,
      bekleyen: bekleyen,
      success_rate: toplam > 0 ? Math.round((teslim / toplam) * 100) : 0,
    });
  }

  res.json(sonuc);
});

// Kurye performansı
router.get('/couriers', async (req, res) => {
  const kuryeler = await User.find({ role: 'kurye', is_active: true })
    .populate('branch_id')
    .sort({ full_name: 1 });

  const sonuc = [];
  for (const k of kuryeler) {
    const dagitimda = await Shipment.countDocuments({ courier_id: k._id, status: 'dagitimda' });
    const teslim = await Shipment.countDocuments({ courier_id: k._id, status: 'teslim_edildi' });
    const bugunTeslim = await Shipment.countDocuments({
      courier_id: k._id,
      status: 'teslim_edildi',
      delivered_at: { $gte: gunBasi(), $lt: gunSonu() },
    });

    // Tahsilatı ayrı koleksiyondan topluyoruz; gönderi sayısıyla çarpışmasın
    const tahsilatlar = await CodCollection.find({ courier_id: k._id }).select('amount');
    let tahsilat = 0;
    tahsilatlar.forEach((t) => (tahsilat += Number(t.amount)));

    sonuc.push({
      id: k._id.toString(),
      full_name: k.full_name,
      plate: k.plate,
      branch_name: k.branch_id ? k.branch_id.name : null,
      dagitimda: dagitimda,
      teslim: teslim,
      bugun_teslim: bugunTeslim,
      tahsilat: tahsilat,
    });
  }

  res.json(sonuc);
});

// Tacir bazında kapıda ödeme mutabakatı
router.get('/cod-settlement', async (req, res) => {
  const filtre = req.kullanici.role === 'tacir'
    ? { _id: req.kullanici.merchantId, is_active: true }
    : { is_active: true };

  const tacirler = await Merchant.find(filtre).sort({ company_name: 1 });

  const sonuc = [];
  for (const t of tacirler) {
    // Tacirin gönderileri → o gönderilere ait tahsilatlar
    const gonderiler = await Shipment.find({ merchant_id: t._id }).select('_id');
    const tahsilatlar = await CodCollection.find({
      shipment_id: { $in: gonderiler.map((g) => g._id) },
    });

    let toplam = 0;
    let odenmemis = 0;
    tahsilatlar.forEach((h) => {
      toplam += Number(h.amount);
      if (!h.settled) odenmemis += Number(h.amount);
    });

    const komisyon = (odenmemis * Number(t.cod_commission)) / 100;

    sonuc.push({
      id: t._id.toString(),
      code: t.code,
      company_name: t.company_name,
      cod_commission: t.cod_commission,
      tahsilat_adedi: tahsilatlar.length,
      toplam: toplam,
      odenmemis: odenmemis,
      commission: komisyon,
      // Tacire ödenecek net tutar
      net_payable: odenmemis - komisyon,
    });
  }

  res.json(sonuc);
});

// Son 7 günün gönderi ve teslimat sayıları
router.get('/daily', async (req, res) => {
  const temel = req.kullanici.role === 'tacir'
    ? { merchant_id: req.kullanici.merchantId }
    : {};

  const gunler = [];
  for (let i = 6; i >= 0; i--) {
    const gun = new Date();
    gun.setDate(gun.getDate() - i);

    const bas = gunBasi(gun);
    const bit = gunSonu(gun);

    gunler.push({
      date: yerelGun(gun),
      created: await Shipment.countDocuments({ ...temel, created_at: { $gte: bas, $lt: bit } }),
      delivered: await Shipment.countDocuments({ ...temel, delivered_at: { $gte: bas, $lt: bit } }),
    });
  }

  res.json(gunler);
});

module.exports = router;
