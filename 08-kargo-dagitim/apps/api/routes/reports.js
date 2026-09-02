const express = require('express');
const { sorgu, tek } = require('../db');
const { girisGerekli } = require('../auth');
const { yerelGun } = require('../yardimcilar');

const router = express.Router();
router.use(girisGerekli);

router.get('/summary', async (req, res) => {
  // Tacir kullanıcıları sadece kendi rakamlarını görür
  const tacirId = req.kullanici.role === 'tacir' ? req.kullanici.merchantId : null;
  const filtre = tacirId ? 'AND merchant_id = $1' : '';
  const degerler = tacirId ? [tacirId] : [];

  const durumlar = await sorgu(
    `SELECT status, COUNT(*)::int AS adet
       FROM shipments WHERE 1=1 ${filtre}
      GROUP BY status`,
    degerler
  );

  const sayilar = {
    olusturuldu: 0, subede: 0, dagitimda: 0,
    teslim_edildi: 0, teslim_edilemedi: 0, iade: 0,
  };
  for (const d of durumlar) sayilar[d.status] = d.adet;

  // CURRENT_DATE sunucunun yerel tarihi — UTC kaymasını önlüyor
  const bugun = await tek(
    `SELECT
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS yeni,
        COUNT(*) FILTER (WHERE delivered_at::date = CURRENT_DATE)::int AS teslim
       FROM shipments WHERE 1=1 ${filtre}`,
    degerler
  );

  const kapidaOdeme = await tek(
    `SELECT
        COALESCE(SUM(cod_amount) FILTER (WHERE status <> 'teslim_edildi'), 0)::numeric AS bekleyen,
        COALESCE(SUM(cod_amount) FILTER (WHERE status = 'teslim_edildi'), 0)::numeric AS tahsil
       FROM shipments WHERE cod_amount > 0 ${filtre}`,
    degerler
  );

  const ciro = await tek(
    `SELECT COALESCE(SUM(shipping_fee), 0)::numeric AS toplam
       FROM shipments
      WHERE created_at >= date_trunc('month', CURRENT_DATE) ${filtre}`,
    degerler
  );

  res.json({
    date: yerelGun(),
    counts: sayilar,
    total: Object.values(sayilar).reduce((t, s) => t + s, 0),
    today_created: bugun.yeni,
    today_delivered: bugun.teslim,
    cod_pending: Number(kapidaOdeme.bekleyen),
    cod_collected: Number(kapidaOdeme.tahsil),
    month_shipping_revenue: Number(ciro.toplam),
  });
});

// Şube performansı
router.get('/branches', async (req, res) => {
  const liste = await sorgu(
    `SELECT b.id, b.code, b.name,
            COUNT(g.id)::int AS toplam,
            COUNT(g.id) FILTER (WHERE g.status = 'teslim_edildi')::int AS teslim,
            COUNT(g.id) FILTER (WHERE g.status = 'dagitimda')::int AS dagitimda,
            COUNT(g.id) FILTER (WHERE g.status IN ('olusturuldu','subede'))::int AS bekleyen
       FROM branches b
       LEFT JOIN shipments g ON g.dest_branch_id = b.id
      WHERE b.is_active = TRUE
      GROUP BY b.id, b.code, b.name
      ORDER BY b.name`
  );

  res.json(liste.map((s) => ({
    ...s,
    success_rate: s.toplam > 0 ? Math.round((s.teslim / s.toplam) * 100) : 0,
  })));
});

// Kurye performansı
router.get('/couriers', async (req, res) => {
  // DİKKAT: shipments ve cod_collections tablolarını aynı anda JOIN edersek
  // satırlar çarpışır ve toplamlar şişer. Bu yüzden tahsilatı alt sorguyla alıyoruz.
  const liste = await sorgu(
    `SELECT u.id, u.full_name, u.plate, b.name AS branch_name,
            COUNT(g.id) FILTER (WHERE g.status = 'dagitimda')::int AS dagitimda,
            COUNT(g.id) FILTER (WHERE g.status = 'teslim_edildi')::int AS teslim,
            COUNT(g.id) FILTER (WHERE g.status = 'teslim_edildi'
                                AND g.delivered_at::date = CURRENT_DATE)::int AS bugun_teslim,
            (SELECT COALESCE(SUM(t.amount), 0)::numeric
               FROM cod_collections t WHERE t.courier_id = u.id) AS tahsilat
       FROM users u
       LEFT JOIN branches b ON b.id = u.branch_id
       LEFT JOIN shipments g ON g.courier_id = u.id
      WHERE u.role = 'kurye' AND u.is_active = TRUE
      GROUP BY u.id, u.full_name, u.plate, b.name
      ORDER BY u.full_name`
  );
  res.json(liste);
});

// Tacir bazında kapıda ödeme mutabakatı
router.get('/cod-settlement', async (req, res) => {
  const tacirId = req.kullanici.role === 'tacir' ? req.kullanici.merchantId : null;
  const filtre = tacirId ? 'AND m.id = $1' : '';
  const degerler = tacirId ? [tacirId] : [];

  const liste = await sorgu(
    `SELECT m.id, m.code, m.company_name, m.cod_commission,
            COUNT(t.id)::int AS tahsilat_adedi,
            COALESCE(SUM(t.amount), 0)::numeric AS toplam,
            COALESCE(SUM(t.amount) FILTER (WHERE t.settled = FALSE), 0)::numeric AS odenmemis
       FROM merchants m
       LEFT JOIN shipments g ON g.merchant_id = m.id
       LEFT JOIN cod_collections t ON t.shipment_id = g.id
      WHERE m.is_active = TRUE ${filtre}
      GROUP BY m.id, m.code, m.company_name, m.cod_commission
      ORDER BY m.company_name`,
    degerler
  );

  res.json(liste.map((t) => {
    const odenmemis = Number(t.odenmemis);
    const komisyon = (odenmemis * Number(t.cod_commission)) / 100;
    return {
      ...t,
      commission: komisyon,
      // Tacire ödenecek net tutar
      net_payable: odenmemis - komisyon,
    };
  }));
});

// Son 7 günün gönderi ve teslimat sayıları
router.get('/daily', async (req, res) => {
  const tacirId = req.kullanici.role === 'tacir' ? req.kullanici.merchantId : null;
  const filtre = tacirId ? 'AND merchant_id = $1' : '';
  const degerler = tacirId ? [tacirId] : [];

  const liste = await sorgu(
    `SELECT gun::date AS tarih,
            (SELECT COUNT(*) FROM shipments
              WHERE created_at::date = gun::date ${filtre})::int AS olusturulan,
            (SELECT COUNT(*) FROM shipments
              WHERE delivered_at::date = gun::date ${filtre})::int AS teslim
       FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS gun
      ORDER BY gun`,
    degerler
  );

  res.json(liste.map((g) => ({
    date: yerelGun(g.tarih),
    created: g.olusturulan,
    delivered: g.teslim,
  })));
});

module.exports = router;
