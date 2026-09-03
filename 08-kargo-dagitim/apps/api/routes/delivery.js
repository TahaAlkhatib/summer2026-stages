const express = require('express');
const Shipment = require('../models/Shipment');
const CodCollection = require('../models/CodCollection');
const ShipmentEvent = require('../models/ShipmentEvent');
const { girisGerekli, rolGerekli } = require('../auth');
const { hareketEkle, gunBasi, gunSonu } = require('../yardimcilar');

const router = express.Router();
router.use(girisGerekli);

// Kuryenin bugünkü dağıtım listesi
router.get('/my-route', rolGerekli('kurye', 'admin'), async (req, res) => {
  const kuryeId = req.kullanici.role === 'kurye' ? req.kullanici.id : req.query.courierId;

  const liste = await Shipment.find({ courier_id: kuryeId, status: 'dagitimda' })
    .populate('merchant_id')
    .populate('dest_branch_id')
    .sort({ receiver_district: 1, barcode: 1 });

  let kapidaOdemeToplam = 0;
  for (const g of liste) kapidaOdemeToplam += Number(g.cod_amount);

  // Bugün teslim ettikleri
  const teslimEdilen = await Shipment.find({
    courier_id: kuryeId,
    status: 'teslim_edildi',
    delivered_at: { $gte: gunBasi(), $lt: gunSonu() },
  }).sort({ delivered_at: -1 });

  const tahsilatlar = await CodCollection.find({
    courier_id: kuryeId,
    collected_at: { $gte: gunBasi(), $lt: gunSonu() },
  });

  let tahsilEdilen = 0;
  tahsilatlar.forEach((t) => (tahsilEdilen += Number(t.amount)));

  res.json({
    pending: liste.map((g) => ({
      id: g._id.toString(),
      barcode: g.barcode,
      receiver_name: g.receiver_name,
      receiver_phone: g.receiver_phone,
      receiver_address: g.receiver_address,
      receiver_district: g.receiver_district,
      cod_amount: g.cod_amount,
      desi: g.desi,
      content: g.content,
      company_name: g.merchant_id ? g.merchant_id.company_name : '',
      dest_branch_name: g.dest_branch_id ? g.dest_branch_id.name : '',
    })),
    pending_cod_total: kapidaOdemeToplam,
    delivered_today: teslimEdilen.map((g) => ({
      barcode: g.barcode,
      receiver_name: g.receiver_name,
      cod_amount: g.cod_amount,
      delivered_at: g.delivered_at,
    })),
    collected_today: tahsilEdilen,
  });
});

// DEMO KOLAYLIĞI: teslimat kodunu görüntüleme.
// Gerçek hayatta bu kod alıcıya SMS ile gider, kurye göremez.
// Sunumda kod gösterilebilsin diye bırakıldı.
router.get('/:id/otp', rolGerekli('kurye', 'admin', 'operasyon'), async (req, res) => {
  const gonderi = await Shipment.findById(req.params.id)
    .select('barcode otp_code receiver_phone')
    .catch(() => null);

  if (!gonderi) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

  res.json({
    barcode: gonderi.barcode,
    otp: gonderi.otp_code,
    phone: gonderi.receiver_phone,
    note: 'Bu kod normalde alıcıya SMS ile gider. Demo için gösteriliyor.',
  });
});

// Teslimat: OTP doğrulaması + imza + varsa kapıda ödeme tahsilatı
router.post('/:id/deliver', rolGerekli('kurye', 'admin'), async (req, res) => {
  const { otp, deliveredTo, signature, note, codMethod } = req.body;

  const gonderi = await Shipment.findById(req.params.id).catch(() => null);
  if (!gonderi) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

  if (gonderi.status !== 'dagitimda') {
    return res.status(400).json({ message: 'Bu gönderi dağıtımda değil.' });
  }
  if (
    req.kullanici.role === 'kurye' &&
    (!gonderi.courier_id || gonderi.courier_id.toString() !== req.kullanici.id)
  ) {
    return res.status(403).json({ message: 'Bu gönderi size zimmetli değil.' });
  }

  if (!otp || otp.trim() !== gonderi.otp_code) {
    return res.status(400).json({ message: 'Teslimat kodu hatalı. Alıcıdan kodu tekrar isteyin.' });
  }
  if (!deliveredTo || !deliveredTo.trim()) {
    return res.status(400).json({ message: 'Teslim alan kişinin adı zorunludur.' });
  }
  if (!signature) {
    return res.status(400).json({ message: 'Alıcı imzası alınmalıdır.' });
  }

  const kapidaOdeme = Number(gonderi.cod_amount);

  gonderi.status = 'teslim_edildi';
  gonderi.delivered_at = new Date();
  gonderi.delivered_to = deliveredTo.trim();
  gonderi.signature = signature;
  gonderi.delivery_note = note || null;
  gonderi.otp_code = null;
  await gonderi.save();

  // Kapıda ödeme varsa tahsilat kaydı açılıyor
  if (kapidaOdeme > 0) {
    await CodCollection.create({
      shipment_id: gonderi._id,
      amount: kapidaOdeme,
      method: codMethod === 'kredi_karti' ? 'kredi_karti' : 'nakit',
      courier_id: req.kullanici.id,
    });
  }

  await ShipmentEvent.create({
    shipment_id: gonderi._id,
    status: 'teslim_edildi',
    description:
      `${deliveredTo.trim()} kişisine teslim edildi.` +
      (kapidaOdeme > 0 ? ` Kapıda ödeme tahsil edildi: ${kapidaOdeme.toFixed(2)} ₺.` : ''),
    user_id: req.kullanici.id,
  });

  res.json({
    message:
      'Teslimat tamamlandı.' +
      (kapidaOdeme > 0 ? ` ${kapidaOdeme.toFixed(2)} ₺ tahsil edildi.` : ''),
    cod_collected: kapidaOdeme,
  });
});

// Teslim edilemedi — sebep kaydedilir, gönderi şubeye döner
router.post('/:id/fail', rolGerekli('kurye', 'admin'), async (req, res) => {
  const { reason } = req.body;

  const gonderi = await Shipment.findById(req.params.id).catch(() => null);
  if (!gonderi) return res.status(404).json({ message: 'Gönderi bulunamadı.' });
  if (gonderi.status !== 'dagitimda') {
    return res.status(400).json({ message: 'Bu gönderi dağıtımda değil.' });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'Teslim edilememe sebebi zorunludur.' });
  }

  // 3. denemeden sonra gönderi iadeye ayrılıyor
  const yeniDurum = gonderi.attempt_count >= 3 ? 'iade' : 'teslim_edilemedi';
  const denemeSayisi = gonderi.attempt_count;
  const varisSubeId = gonderi.dest_branch_id;

  gonderi.status = yeniDurum;
  gonderi.delivery_note = reason.trim();
  gonderi.courier_id = null;
  gonderi.otp_code = null;
  await gonderi.save();

  await hareketEkle(
    gonderi._id, yeniDurum,
    yeniDurum === 'iade'
      ? `3 deneme sonunda teslim edilemedi, iadeye ayrıldı. Sebep: ${reason.trim()}`
      : `Teslim edilemedi (${denemeSayisi}. deneme). Sebep: ${reason.trim()}`,
    varisSubeId, req.kullanici.id
  );

  res.json({
    status: yeniDurum,
    message: yeniDurum === 'iade'
      ? 'Gönderi iadeye ayrıldı.'
      : 'Teslim edilemedi olarak kaydedildi, gönderi şubeye dönecek.',
  });
});

module.exports = router;
