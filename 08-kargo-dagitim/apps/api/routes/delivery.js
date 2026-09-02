const express = require('express');
const { havuz, tek, sorgu } = require('../db');
const { girisGerekli, rolGerekli } = require('../auth');
const { hareketEkle, otpUret } = require('../yardimcilar');

const router = express.Router();
router.use(girisGerekli);

// Kuryenin bugünkü dağıtım listesi
router.get('/my-route', rolGerekli('kurye', 'admin'), async (req, res) => {
  const kuryeId = req.kullanici.role === 'kurye' ? req.kullanici.id : req.query.courierId;

  const liste = await sorgu(
    `SELECT g.*, m.company_name, vs.name AS dest_branch_name
       FROM shipments g
       JOIN merchants m ON m.id = g.merchant_id
       LEFT JOIN branches vs ON vs.id = g.dest_branch_id
      WHERE g.courier_id = $1 AND g.status = 'dagitimda'
      ORDER BY g.receiver_district, g.barcode`,
    [kuryeId]
  );

  let kapidaOdemeToplam = 0;
  for (const g of liste) kapidaOdemeToplam += Number(g.cod_amount);

  // Bugün teslim ettikleri
  const teslimEdilen = await sorgu(
    `SELECT g.barcode, g.receiver_name, g.cod_amount, g.delivered_at
       FROM shipments g
      WHERE g.courier_id = $1 AND g.status = 'teslim_edildi'
        AND g.delivered_at::date = CURRENT_DATE
      ORDER BY g.delivered_at DESC`,
    [kuryeId]
  );

  let tahsilEdilen = 0;
  const tahsilat = await tek(
    `SELECT COALESCE(SUM(amount), 0)::numeric AS toplam
       FROM cod_collections
      WHERE courier_id = $1 AND collected_at::date = CURRENT_DATE`,
    [kuryeId]
  );
  if (tahsilat) tahsilEdilen = Number(tahsilat.toplam);

  res.json({
    pending: liste,
    pending_cod_total: kapidaOdemeToplam,
    delivered_today: teslimEdilen,
    collected_today: tahsilEdilen,
  });
});

// DEMO KOLAYLIĞI: teslimat kodunu görüntüleme.
// Gerçek hayatta bu kod alıcıya SMS ile gider, kurye göremez.
// Sunumda kod gösterilebilsin diye bırakıldı.
router.get('/:id/otp', rolGerekli('kurye', 'admin', 'operasyon'), async (req, res) => {
  const gonderi = await tek(
    `SELECT id, barcode, otp_code, receiver_phone FROM shipments WHERE id = $1`,
    [req.params.id]
  );
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

  const gonderi = await tek(`SELECT * FROM shipments WHERE id = $1`, [req.params.id]);
  if (!gonderi) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

  if (gonderi.status !== 'dagitimda') {
    return res.status(400).json({ message: 'Bu gönderi dağıtımda değil.' });
  }
  if (req.kullanici.role === 'kurye' && gonderi.courier_id !== req.kullanici.id) {
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

  const istemci = await havuz.connect();
  try {
    await istemci.query('BEGIN');

    await istemci.query(
      `UPDATE shipments
          SET status = 'teslim_edildi', delivered_at = NOW(),
              delivered_to = $1, signature = $2, delivery_note = $3,
              otp_code = NULL
        WHERE id = $4`,
      [deliveredTo.trim(), signature, note || null, gonderi.id]
    );

    // Kapıda ödeme varsa tahsilat kaydı açılıyor
    if (Number(gonderi.cod_amount) > 0) {
      await istemci.query(
        `INSERT INTO cod_collections (shipment_id, amount, method, courier_id)
         VALUES ($1, $2, $3, $4)`,
        [gonderi.id, gonderi.cod_amount,
         codMethod === 'kredi_karti' ? 'kredi_karti' : 'nakit', req.kullanici.id]
      );
    }

    await istemci.query(
      `INSERT INTO shipment_events (shipment_id, status, description, user_id)
       VALUES ($1, 'teslim_edildi', $2, $3)`,
      [
        gonderi.id,
        `${deliveredTo.trim()} kişisine teslim edildi.` +
          (Number(gonderi.cod_amount) > 0
            ? ` Kapıda ödeme tahsil edildi: ${Number(gonderi.cod_amount).toFixed(2)} ₺.`
            : ''),
        req.kullanici.id,
      ]
    );

    await istemci.query('COMMIT');

    res.json({
      message: 'Teslimat tamamlandı.' +
        (Number(gonderi.cod_amount) > 0
          ? ` ${Number(gonderi.cod_amount).toFixed(2)} ₺ tahsil edildi.`
          : ''),
      cod_collected: Number(gonderi.cod_amount),
    });
  } catch (hata) {
    await istemci.query('ROLLBACK');
    console.error(hata);
    res.status(500).json({ message: 'Teslimat kaydedilemedi.' });
  } finally {
    istemci.release();
  }
});

// Teslim edilemedi — sebep kaydedilir, gönderi şubeye döner
router.post('/:id/fail', rolGerekli('kurye', 'admin'), async (req, res) => {
  const { reason } = req.body;

  const gonderi = await tek(`SELECT * FROM shipments WHERE id = $1`, [req.params.id]);
  if (!gonderi) return res.status(404).json({ message: 'Gönderi bulunamadı.' });
  if (gonderi.status !== 'dagitimda') {
    return res.status(400).json({ message: 'Bu gönderi dağıtımda değil.' });
  }
  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'Teslim edilememe sebebi zorunludur.' });
  }

  // 3. denemeden sonra gönderi iadeye ayrılıyor
  const yeniDurum = gonderi.attempt_count >= 3 ? 'iade' : 'teslim_edilemedi';

  await sorgu(
    `UPDATE shipments
        SET status = $1, delivery_note = $2, courier_id = NULL, otp_code = NULL
      WHERE id = $3`,
    [yeniDurum, reason.trim(), gonderi.id]
  );

  await hareketEkle(gonderi.id, yeniDurum,
    yeniDurum === 'iade'
      ? `3 deneme sonunda teslim edilemedi, iadeye ayrıldı. Sebep: ${reason.trim()}`
      : `Teslim edilemedi (${gonderi.attempt_count}. deneme). Sebep: ${reason.trim()}`,
    gonderi.dest_branch_id, req.kullanici.id);

  res.json({
    status: yeniDurum,
    message: yeniDurum === 'iade'
      ? 'Gönderi iadeye ayrıldı.'
      : 'Teslim edilemedi olarak kaydedildi, gönderi şubeye dönecek.',
  });
});

module.exports = router;
