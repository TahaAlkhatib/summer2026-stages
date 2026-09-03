const express = require('express');
const Shipment = require('../models/Shipment');
const ShipmentEvent = require('../models/ShipmentEvent');
const CodCollection = require('../models/CodCollection');
const Merchant = require('../models/Merchant');
const Branch = require('../models/Branch');
const { girisGerekli, rolGerekli } = require('../auth');
const {
  barkodUret, subeBul, ucretHesapla, hareketEkle, DURUMLAR,
} = require('../yardimcilar');

const router = express.Router();
router.use(girisGerekli);

// Liste cevabını istemcilerin beklediği düz biçime çevirir
function bicimle(g) {
  return {
    id: g._id.toString(),
    barcode: g.barcode,
    merchant_id: g.merchant_id ? (g.merchant_id._id || g.merchant_id).toString() : null,
    company_name: g.merchant_id && g.merchant_id.company_name ? g.merchant_id.company_name : '',
    merchant_code: g.merchant_id && g.merchant_id.code ? g.merchant_id.code : '',
    origin_branch_name: g.origin_branch_id && g.origin_branch_id.name ? g.origin_branch_id.name : '',
    dest_branch_id: g.dest_branch_id ? (g.dest_branch_id._id || g.dest_branch_id).toString() : null,
    dest_branch_name: g.dest_branch_id && g.dest_branch_id.name ? g.dest_branch_id.name : '',
    courier_id: g.courier_id ? (g.courier_id._id || g.courier_id).toString() : null,
    courier_name: g.courier_id && g.courier_id.full_name ? g.courier_id.full_name : null,
    receiver_name: g.receiver_name,
    receiver_phone: g.receiver_phone,
    receiver_address: g.receiver_address,
    receiver_district: g.receiver_district,
    receiver_city: g.receiver_city,
    desi: g.desi,
    weight_kg: g.weight_kg,
    content: g.content,
    payment_type: g.payment_type,
    shipping_fee: g.shipping_fee,
    cod_amount: g.cod_amount,
    status: g.status,
    delivered_at: g.delivered_at,
    delivered_to: g.delivered_to,
    delivery_note: g.delivery_note,
    attempt_count: g.attempt_count,
    signature: g.signature,
    created_at: g.created_at,
  };
}

// Gönderi listesi.
// Tacir kullanıcıları sadece kendi gönderilerini görebilir.
router.get('/', async (req, res) => {
  const filtre = {};

  if (req.kullanici.role === 'tacir') {
    filtre.merchant_id = req.kullanici.merchantId;
  } else if (req.query.merchantId) {
    filtre.merchant_id = req.query.merchantId;
  }

  if (req.query.status) filtre.status = req.query.status;
  if (req.query.destBranchId) filtre.dest_branch_id = req.query.destBranchId;
  if (req.query.courierId) filtre.courier_id = req.query.courierId;

  if (req.query.q) {
    // Büyük/küçük harf duyarsız arama düzenli ifade (regex) ile yapılır
    const desen = new RegExp(req.query.q, 'i');
    filtre.$or = [
      { barcode: desen },
      { receiver_name: desen },
      { receiver_phone: desen },
      { receiver_district: desen },
    ];
  }
  // Sadece kapıda ödemeli olanlar
  if (req.query.cod === '1') {
    filtre.cod_amount = { $gt: 0 };
  }

  const liste = await Shipment.find(filtre)
    .populate('merchant_id')
    .populate('origin_branch_id')
    .populate('dest_branch_id')
    .populate('courier_id')
    .sort({ created_at: -1 })
    .limit(300);

  res.json(liste.map(bicimle));
});

// Şube ayrıştırma ekranı: dağıtım şubesine göre gruplanmış bekleyen gönderiler
router.get('/sorting/summary', rolGerekli('admin', 'operasyon'), async (req, res) => {
  const subeler = await Branch.find({ is_active: true }).sort({ name: 1 });

  const gruplar = [];
  for (const sube of subeler) {
    const bekleyenler = await Shipment.find({
      dest_branch_id: sube._id,
      status: { $in: ['olusturuldu', 'subede'] },
    }).select('cod_amount');

    let kapidaToplam = 0;
    bekleyenler.forEach((g) => (kapidaToplam += Number(g.cod_amount)));

    gruplar.push({
      branch_id: sube._id.toString(),
      code: sube.code,
      name: sube.name,
      districts: sube.districts,
      adet: bekleyenler.length,
      cod_toplam: kapidaToplam,
    });
  }

  res.json(gruplar);
});

// Barkodla sorgulama — tacir portalındaki takip ekranı da bunu kullanıyor
router.get('/barcode/:barcode', async (req, res) => {
  const gonderi = await Shipment.findOne({ barcode: req.params.barcode.trim().toUpperCase() })
    .populate('merchant_id')
    .populate('origin_branch_id')
    .populate('dest_branch_id')
    .populate('courier_id');

  if (!gonderi) {
    return res.status(404).json({ message: 'Bu barkoda ait gönderi bulunamadı.' });
  }
  if (
    req.kullanici.role === 'tacir' &&
    gonderi.merchant_id._id.toString() !== req.kullanici.merchantId
  ) {
    return res.status(403).json({ message: 'Bu gönderiyi görüntüleme yetkiniz yok.' });
  }

  const hareketler = await ShipmentEvent.find({ shipment_id: gonderi._id })
    .populate('branch_id')
    .populate('user_id')
    .sort({ created_at: 1 });

  const tahsilat = await CodCollection.findOne({ shipment_id: gonderi._id });

  const cevap = bicimle(gonderi);
  cevap.courier_phone = gonderi.courier_id ? gonderi.courier_id.phone : null;

  res.json({
    shipment: cevap,
    events: hareketler.map((h) => ({
      id: h._id.toString(),
      status: h.status,
      status_label: DURUMLAR[h.status] || h.status,
      description: h.description,
      branch_name: h.branch_id ? h.branch_id.name : null,
      user_name: h.user_id ? h.user_id.full_name : null,
      created_at: h.created_at,
    })),
    cod: tahsilat ? tahsilat.toJSON() : null,
  });
});

// Yeni gönderi kaydı
router.post('/', rolGerekli('admin', 'operasyon', 'tacir'), async (req, res) => {
  const {
    merchantId, receiverName, receiverPhone, receiverAddress,
    receiverDistrict, desi, weightKg, content, paymentType, codAmount,
  } = req.body;

  // Tacir kendi adına kayıt açar, operasyon istediği tacir adına
  const tacirId = req.kullanici.role === 'tacir' ? req.kullanici.merchantId : merchantId;

  if (!tacirId) {
    return res.status(400).json({ message: 'Tacir seçilmelidir.' });
  }
  if (!receiverName || !receiverPhone || !receiverAddress || !receiverDistrict) {
    return res.status(400).json({ message: 'Alıcı adı, telefonu, adresi ve ilçesi zorunludur.' });
  }

  const tacir = await Merchant.findOne({ _id: tacirId, is_active: true }).catch(() => null);
  if (!tacir) {
    return res.status(400).json({ message: 'Tacir bulunamadı.' });
  }

  const desiDegeri = Number(desi) || 1;
  if (desiDegeri <= 0) {
    return res.status(400).json({ message: 'Desi sıfırdan büyük olmalıdır.' });
  }

  const kapidaOdeme = Number(codAmount) || 0;
  if (kapidaOdeme < 0) {
    return res.status(400).json({ message: 'Kapıda ödeme tutarı negatif olamaz.' });
  }

  // Şube ayrıştırma: alıcının ilçesine göre dağıtım şubesi belirleniyor
  const varisSube = await subeBul(receiverDistrict);
  if (!varisSube) {
    return res.status(400).json({
      message: `"${receiverDistrict}" ilçesine hizmet veren bir şube yok. ` +
        'Şube tanımlarını kontrol edin.',
    });
  }

  // Çıkış şubesi: personelin şubesi, tacir kayıt açıyorsa tacirin ilçesindeki şube
  let cikisSubeId = req.kullanici.branchId;
  if (!cikisSubeId) {
    const tacirSubesi = await subeBul(tacir.district || '');
    cikisSubeId = tacirSubesi ? tacirSubesi._id : varisSube._id;
  }

  const gonderi = await Shipment.create({
    barcode: await barkodUret(),
    merchant_id: tacir._id,
    origin_branch_id: cikisSubeId,
    dest_branch_id: varisSube._id,
    receiver_name: receiverName.trim(),
    receiver_phone: receiverPhone.trim(),
    receiver_address: receiverAddress.trim(),
    receiver_district: receiverDistrict.trim(),
    desi: desiDegeri,
    weight_kg: weightKg || null,
    content: content || null,
    payment_type: paymentType === 'alici_odemeli' ? 'alici_odemeli' : 'gonderici_odemeli',
    shipping_fee: ucretHesapla(tacir, desiDegeri),
    cod_amount: kapidaOdeme,
    status: 'olusturuldu',
    created_by: req.kullanici.id,
  });

  await hareketEkle(
    gonderi._id, 'olusturuldu',
    `Gönderi kaydı oluşturuldu. Dağıtım şubesi: ${varisSube.name}`,
    cikisSubeId, req.kullanici.id
  );

  const cevap = gonderi.toJSON();
  cevap.dest_branch_name = varisSube.name;
  res.status(201).json(cevap);
});

// Şubeye giriş (kabul) — barkod okutulur
router.post('/:id/accept', rolGerekli('admin', 'operasyon'), async (req, res) => {
  const gonderi = await Shipment.findById(req.params.id).catch(() => null);
  if (!gonderi) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

  if (gonderi.status === 'teslim_edildi') {
    return res.status(400).json({ message: 'Teslim edilmiş gönderi tekrar kabul edilemez.' });
  }

  gonderi.status = 'subede';
  await gonderi.save();

  await hareketEkle(gonderi._id, 'subede', 'Şubeye kabul edildi.',
    req.kullanici.branchId, req.kullanici.id);

  res.json(gonderi);
});

module.exports = router;
