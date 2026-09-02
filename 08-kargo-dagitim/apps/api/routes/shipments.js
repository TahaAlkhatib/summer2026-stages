const express = require('express');
const { sorgu, tek } = require('../db');
const { girisGerekli, rolGerekli } = require('../auth');
const {
  barkodUret, subeBul, ucretHesapla, hareketEkle, DURUMLAR,
} = require('../yardimcilar');

const router = express.Router();
router.use(girisGerekli);

// Gönderi listesi.
// Tacir kullanıcıları sadece kendi gönderilerini görebilir.
router.get('/', async (req, res) => {
  const kosullar = [];
  const degerler = [];

  if (req.kullanici.role === 'tacir') {
    degerler.push(req.kullanici.merchantId);
    kosullar.push(`g.merchant_id = $${degerler.length}`);
  } else if (req.query.merchantId) {
    degerler.push(req.query.merchantId);
    kosullar.push(`g.merchant_id = $${degerler.length}`);
  }

  if (req.query.status) {
    degerler.push(req.query.status);
    kosullar.push(`g.status = $${degerler.length}`);
  }
  if (req.query.destBranchId) {
    degerler.push(req.query.destBranchId);
    kosullar.push(`g.dest_branch_id = $${degerler.length}`);
  }
  if (req.query.courierId) {
    degerler.push(req.query.courierId);
    kosullar.push(`g.courier_id = $${degerler.length}`);
  }
  if (req.query.q) {
    degerler.push(`%${req.query.q}%`);
    const n = degerler.length;
    // ILIKE: PostgreSQL'de büyük/küçük harf duyarsız arama
    kosullar.push(`(g.barcode ILIKE $${n} OR g.receiver_name ILIKE $${n}
                    OR g.receiver_phone ILIKE $${n} OR g.receiver_district ILIKE $${n})`);
  }
  // Sadece kapıda ödemeli olanlar
  if (req.query.cod === '1') {
    kosullar.push(`g.cod_amount > 0`);
  }

  const nerede = kosullar.length ? 'WHERE ' + kosullar.join(' AND ') : '';

  const liste = await sorgu(
    `SELECT g.*, m.company_name, m.code AS merchant_code,
            cs.name AS origin_branch_name, vs.name AS dest_branch_name,
            k.full_name AS courier_name
       FROM shipments g
       JOIN merchants m ON m.id = g.merchant_id
       JOIN branches cs ON cs.id = g.origin_branch_id
       LEFT JOIN branches vs ON vs.id = g.dest_branch_id
       LEFT JOIN users k ON k.id = g.courier_id
       ${nerede}
      ORDER BY g.created_at DESC
      LIMIT 300`,
    degerler
  );

  res.json(liste);
});

// Barkodla sorgulama — tacir portalındaki takip ekranı da bunu kullanıyor
router.get('/barcode/:barcode', async (req, res) => {
  const gonderi = await tek(
    `SELECT g.*, m.company_name, cs.name AS origin_branch_name,
            vs.name AS dest_branch_name, k.full_name AS courier_name, k.phone AS courier_phone
       FROM shipments g
       JOIN merchants m ON m.id = g.merchant_id
       JOIN branches cs ON cs.id = g.origin_branch_id
       LEFT JOIN branches vs ON vs.id = g.dest_branch_id
       LEFT JOIN users k ON k.id = g.courier_id
      WHERE g.barcode = $1`,
    [req.params.barcode.trim().toUpperCase()]
  );

  if (!gonderi) {
    return res.status(404).json({ message: 'Bu barkoda ait gönderi bulunamadı.' });
  }
  if (req.kullanici.role === 'tacir' && gonderi.merchant_id !== req.kullanici.merchantId) {
    return res.status(403).json({ message: 'Bu gönderiyi görüntüleme yetkiniz yok.' });
  }

  const hareketler = await sorgu(
    `SELECT e.*, b.name AS branch_name, u.full_name AS user_name
       FROM shipment_events e
       LEFT JOIN branches b ON b.id = e.branch_id
       LEFT JOIN users u ON u.id = e.user_id
      WHERE e.shipment_id = $1
      ORDER BY e.created_at`,
    [gonderi.id]
  );

  const tahsilat = await tek(
    `SELECT * FROM cod_collections WHERE shipment_id = $1`, [gonderi.id]
  );

  res.json({
    shipment: gonderi,
    events: hareketler.map((h) => ({ ...h, status_label: DURUMLAR[h.status] || h.status })),
    cod: tahsilat,
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

  const tacir = await tek(`SELECT * FROM merchants WHERE id = $1 AND is_active = TRUE`, [tacirId]);
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
    cikisSubeId = tacirSubesi ? tacirSubesi.id : varisSube.id;
  }

  const barkod = await barkodUret();
  const ucret = ucretHesapla(tacir, desiDegeri);

  const gonderi = await tek(
    `INSERT INTO shipments
       (barcode, merchant_id, origin_branch_id, dest_branch_id,
        receiver_name, receiver_phone, receiver_address, receiver_district,
        desi, weight_kg, content, payment_type, shipping_fee, cod_amount,
        status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'olusturuldu',$15)
     RETURNING *`,
    [
      barkod, tacir.id, cikisSubeId, varisSube.id,
      receiverName.trim(), receiverPhone.trim(), receiverAddress.trim(),
      receiverDistrict.trim(), desiDegeri, weightKg || null, content || null,
      paymentType === 'alici_odemeli' ? 'alici_odemeli' : 'gonderici_odemeli',
      ucret, kapidaOdeme, req.kullanici.id,
    ]
  );

  await hareketEkle(gonderi.id, 'olusturuldu',
    `Gönderi kaydı oluşturuldu. Dağıtım şubesi: ${varisSube.name}`,
    cikisSubeId, req.kullanici.id);

  res.status(201).json({ ...gonderi, dest_branch_name: varisSube.name });
});

// Şubeye giriş (kabul) — barkod okutulur
router.post('/:id/accept', rolGerekli('admin', 'operasyon'), async (req, res) => {
  const gonderi = await tek(`SELECT * FROM shipments WHERE id = $1`, [req.params.id]);
  if (!gonderi) return res.status(404).json({ message: 'Gönderi bulunamadı.' });

  if (gonderi.status === 'teslim_edildi') {
    return res.status(400).json({ message: 'Teslim edilmiş gönderi tekrar kabul edilemez.' });
  }

  const guncel = await tek(
    `UPDATE shipments SET status = 'subede' WHERE id = $1 RETURNING *`, [gonderi.id]
  );

  await hareketEkle(gonderi.id, 'subede', 'Şubeye kabul edildi.',
    req.kullanici.branchId, req.kullanici.id);

  res.json(guncel);
});

// Şube ayrıştırma ekranı: dağıtım şubesine göre gruplanmış bekleyen gönderiler
router.get('/sorting/summary', rolGerekli('admin', 'operasyon'), async (req, res) => {
  const gruplar = await sorgu(
    `SELECT b.id AS branch_id, b.code, b.name, b.districts,
            COUNT(g.id)::int AS adet,
            COALESCE(SUM(g.cod_amount), 0)::numeric AS cod_toplam
       FROM branches b
       LEFT JOIN shipments g
         ON g.dest_branch_id = b.id AND g.status IN ('olusturuldu', 'subede')
      WHERE b.is_active = TRUE
      GROUP BY b.id, b.code, b.name, b.districts
      ORDER BY b.name`
  );
  res.json(gruplar);
});

module.exports = router;
