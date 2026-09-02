const express = require('express');
const { havuz, sorgu, tek } = require('../db');
const { girisGerekli, rolGerekli } = require('../auth');
const { irsaliyeKoduUret, hareketEkle, otpUret } = require('../yardimcilar');

const router = express.Router();
router.use(girisGerekli);

router.get('/', async (req, res) => {
  const liste = await sorgu(
    `SELECT i.*, cs.name AS origin_branch_name, vs.name AS dest_branch_name,
            k.full_name AS courier_name, u.full_name AS created_by_name
       FROM manifests i
       JOIN branches cs ON cs.id = i.origin_branch_id
       LEFT JOIN branches vs ON vs.id = i.dest_branch_id
       LEFT JOIN users k ON k.id = i.courier_id
       LEFT JOIN users u ON u.id = i.created_by
      ORDER BY i.created_at DESC
      LIMIT 100`
  );
  res.json(liste);
});

// İrsaliye detayı — basım ekranı bunu kullanıyor
router.get('/:id', async (req, res) => {
  const irsaliye = await tek(
    `SELECT i.*, cs.name AS origin_branch_name, cs.code AS origin_branch_code,
            vs.name AS dest_branch_name, k.full_name AS courier_name, k.plate,
            u.full_name AS created_by_name
       FROM manifests i
       JOIN branches cs ON cs.id = i.origin_branch_id
       LEFT JOIN branches vs ON vs.id = i.dest_branch_id
       LEFT JOIN users k ON k.id = i.courier_id
       LEFT JOIN users u ON u.id = i.created_by
      WHERE i.id = $1`,
    [req.params.id]
  );

  if (!irsaliye) return res.status(404).json({ message: 'İrsaliye bulunamadı.' });

  const kalemler = await sorgu(
    `SELECT g.*, m.company_name, vs.name AS dest_branch_name
       FROM manifest_items k
       JOIN shipments g ON g.id = k.shipment_id
       JOIN merchants m ON m.id = g.merchant_id
       LEFT JOIN branches vs ON vs.id = g.dest_branch_id
      WHERE k.manifest_id = $1
      ORDER BY g.receiver_district, g.barcode`,
    [irsaliye.id]
  );

  res.json({ manifest: irsaliye, items: kalemler });
});

// Toplu irsaliye oluşturma.
// type = sube_sevk    -> gönderiler karşı şubeye yollanır
// type = kurye_dagitim -> gönderiler kuryeye zimmetlenir, OTP üretilir
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
  const uygunOlmayan = await sorgu(
    `SELECT barcode FROM shipments
      WHERE id = ANY($1::int[]) AND status IN ('teslim_edildi', 'iade')`,
    [shipmentIds]
  );
  if (uygunOlmayan.length > 0) {
    return res.status(400).json({
      message: 'Şu gönderiler kapanmış durumda, irsaliyeye eklenemez: ' +
        uygunOlmayan.map((g) => g.barcode).join(', '),
    });
  }

  const istemci = await havuz.connect();
  try {
    await istemci.query('BEGIN');

    const kod = await irsaliyeKoduUret();

    const irsaliyeSonuc = await istemci.query(
      `INSERT INTO manifests (code, type, origin_branch_id, dest_branch_id,
                              courier_id, item_count, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [kod, type, cikisSubeId, destBranchId || null, courierId || null,
       shipmentIds.length, notes || null, req.kullanici.id]
    );
    const irsaliye = irsaliyeSonuc.rows[0];

    for (const gonderiId of shipmentIds) {
      await istemci.query(
        `INSERT INTO manifest_items (manifest_id, shipment_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [irsaliye.id, gonderiId]
      );

      if (type === 'kurye_dagitim') {
        // Kuryeye çıkışta teslimat doğrulama kodu üretiliyor.
        // Gerçek hayatta bu kod alıcıya SMS ile gider.
        await istemci.query(
          `UPDATE shipments
              SET status = 'dagitimda', courier_id = $1,
                  otp_code = $2, otp_sent_at = NOW(),
                  attempt_count = attempt_count + 1
            WHERE id = $3`,
          [courierId, otpUret(), gonderiId]
        );
      } else {
        await istemci.query(
          `UPDATE shipments SET status = 'subede' WHERE id = $1`, [gonderiId]
        );
      }

      await istemci.query(
        `INSERT INTO shipment_events (shipment_id, status, description, branch_id, user_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          gonderiId,
          type === 'kurye_dagitim' ? 'dagitimda' : 'subede',
          type === 'kurye_dagitim'
            ? `${kod} irsaliyesiyle kuryeye zimmetlendi. Teslimat kodu alıcıya gönderildi.`
            : `${kod} irsaliyesiyle sevk edildi.`,
          cikisSubeId,
          req.kullanici.id,
        ]
      );
    }

    await istemci.query('COMMIT');
    res.status(201).json(irsaliye);
  } catch (hata) {
    await istemci.query('ROLLBACK');
    console.error(hata);
    res.status(500).json({ message: 'İrsaliye oluşturulamadı.' });
  } finally {
    istemci.release();
  }
});

module.exports = router;
