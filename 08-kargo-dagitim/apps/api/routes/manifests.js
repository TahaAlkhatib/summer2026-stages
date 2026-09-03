const express = require('express');
const Manifest = require('../models/Manifest');
const Shipment = require('../models/Shipment');
const { girisGerekli, rolGerekli } = require('../auth');
const { irsaliyeKoduUret, hareketEkle, otpUret } = require('../yardimcilar');

const router = express.Router();
router.use(girisGerekli);

router.get('/', async (req, res) => {
  const liste = await Manifest.find()
    .populate('origin_branch_id')
    .populate('dest_branch_id')
    .populate('courier_id')
    .populate('created_by')
    .sort({ created_at: -1 })
    .limit(100);

  res.json(
    liste.map((i) => ({
      id: i._id.toString(),
      code: i.code,
      type: i.type,
      origin_branch_name: i.origin_branch_id ? i.origin_branch_id.name : '',
      dest_branch_name: i.dest_branch_id ? i.dest_branch_id.name : null,
      courier_name: i.courier_id ? i.courier_id.full_name : null,
      item_count: i.item_count,
      notes: i.notes,
      created_by_name: i.created_by ? i.created_by.full_name : null,
      created_at: i.created_at,
    }))
  );
});

// Toplu irsaliye oluşturma.
// type = sube_sevk     -> gönderiler karşı şubeye yollanır
// type = kurye_dagitim -> gönderiler kuryeye zimmetlenir, OTP üretilir
//
// NOT: MongoDB'de çoklu belge transaction'ı yalnızca replica set kurulumunda
// çalışır. Tek sunucu kurulumunda hata verdiği için önce tüm kontrolleri
// yapıyor, sonra kayıtları sırayla güncelliyoruz. Beklenmeyen bir hata
// olursa açılan irsaliye siliniyor.
router.post('/', rolGerekli('admin', 'operasyon'), async (req, res) => {
  const { type, destBranchId, courierId, shipmentIds, notes } = req.body;

  if (!['sube_sevk', 'kurye_dagitim'].includes(type)) {
    return res.status(400).json({ message: 'Geçersiz irsaliye tipi.' });
  }
  if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
    return res.status(400).json({ message: 'İrsaliyeye en az bir gönderi eklenmelidir.' });
  }
  if (type === 'sube_sevk' && !destBranchId) {
    return res.status(400).json({ message: 'Varış şubesi seçilmelidir.' });
  }
  if (type === 'kurye_dagitim' && !courierId) {
    return res.status(400).json({ message: 'Kurye seçilmelidir.' });
  }

  const cikisSubeId = req.kullanici.branchId;
  if (!cikisSubeId) {
    return res.status(400).json({ message: 'Kullanıcınıza şube tanımlı değil.' });
  }

  // Teslim edilmiş gönderiler irsaliyeye eklenemez
  const uygunOlmayan = await Shipment.find({
    _id: { $in: shipmentIds },
    status: { $in: ['teslim_edildi', 'iade'] },
  }).select('barcode');

  if (uygunOlmayan.length > 0) {
    return res.status(400).json({
      message: 'Şu gönderiler kapanmış durumda, irsaliyeye eklenemez: ' +
        uygunOlmayan.map((g) => g.barcode).join(', '),
    });
  }

  let irsaliye = null;
  try {
    const kod = await irsaliyeKoduUret();

    irsaliye = await Manifest.create({
      code: kod,
      type: type,
      origin_branch_id: cikisSubeId,
      dest_branch_id: destBranchId || null,
      courier_id: courierId || null,
      items: shipmentIds,
      item_count: shipmentIds.length,
      notes: notes || null,
      created_by: req.kullanici.id,
    });

    for (const gonderiId of shipmentIds) {
      if (type === 'kurye_dagitim') {
        // Kuryeye çıkışta teslimat doğrulama kodu üretiliyor.
        // Gerçek hayatta bu kod alıcıya SMS ile gider.
        await Shipment.findByIdAndUpdate(gonderiId, {
          status: 'dagitimda',
          courier_id: courierId,
          otp_code: otpUret(),
          otp_sent_at: new Date(),
          $inc: { attempt_count: 1 },
        });
      } else {
        await Shipment.findByIdAndUpdate(gonderiId, { status: 'subede' });
      }

      await hareketEkle(
        gonderiId,
        type === 'kurye_dagitim' ? 'dagitimda' : 'subede',
        type === 'kurye_dagitim'
          ? `${kod} irsaliyesiyle kuryeye zimmetlendi. Teslimat kodu alıcıya gönderildi.`
          : `${kod} irsaliyesiyle sevk edildi.`,
        cikisSubeId,
        req.kullanici.id
      );
    }

    res.status(201).json(irsaliye);
  } catch (hata) {
    console.error(hata);
    if (irsaliye) await Manifest.deleteOne({ _id: irsaliye._id });
    res.status(500).json({ message: 'İrsaliye oluşturulamadı.' });
  }
});

// İrsaliye detayı — basım ekranı bunu kullanıyor
router.get('/:id', async (req, res) => {
  const irsaliye = await Manifest.findById(req.params.id)
    .populate('origin_branch_id')
    .populate('dest_branch_id')
    .populate('courier_id')
    .populate('created_by')
    .catch(() => null);

  if (!irsaliye) return res.status(404).json({ message: 'İrsaliye bulunamadı.' });

  const kalemler = await Shipment.find({ _id: { $in: irsaliye.items } })
    .populate('merchant_id')
    .populate('dest_branch_id')
    .sort({ receiver_district: 1, barcode: 1 });

  res.json({
    manifest: {
      id: irsaliye._id.toString(),
      code: irsaliye.code,
      type: irsaliye.type,
      origin_branch_name: irsaliye.origin_branch_id ? irsaliye.origin_branch_id.name : '',
      origin_branch_code: irsaliye.origin_branch_id ? irsaliye.origin_branch_id.code : '',
      dest_branch_name: irsaliye.dest_branch_id ? irsaliye.dest_branch_id.name : null,
      courier_name: irsaliye.courier_id ? irsaliye.courier_id.full_name : null,
      plate: irsaliye.courier_id ? irsaliye.courier_id.plate : null,
      created_by_name: irsaliye.created_by ? irsaliye.created_by.full_name : null,
      item_count: irsaliye.item_count,
      notes: irsaliye.notes,
      created_at: irsaliye.created_at,
    },
    items: kalemler.map((k) => ({
      id: k._id.toString(),
      barcode: k.barcode,
      receiver_name: k.receiver_name,
      receiver_phone: k.receiver_phone,
      receiver_address: k.receiver_address,
      receiver_district: k.receiver_district,
      desi: k.desi,
      cod_amount: k.cod_amount,
      company_name: k.merchant_id ? k.merchant_id.company_name : '',
      dest_branch_name: k.dest_branch_id ? k.dest_branch_id.name : '',
    })),
  });
});

module.exports = router;
