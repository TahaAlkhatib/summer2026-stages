const { sorgu, tek } = require('./db');

// Gönderi durumlarının Türkçe karşılıkları — hem API hem raporlar kullanıyor
const DURUMLAR = {
  olusturuldu: 'Kayıt oluşturuldu',
  subede: 'Şubede',
  dagitimda: 'Dağıtımda',
  teslim_edildi: 'Teslim edildi',
  teslim_edilemedi: 'Teslim edilemedi',
  iade: 'İade',
};

// Barkod: KRG + yılın son iki hanesi + 6 haneli sıra  →  KRG26000001
async function barkodUret() {
  const yil = new Date().getFullYear().toString().slice(2);
  const satir = await tek(
    `SELECT COUNT(*)::int AS adet FROM shipments WHERE barcode LIKE $1`,
    [`KRG${yil}%`]
  );
  const sira = (satir.adet + 1).toString().padStart(6, '0');
  return `KRG${yil}${sira}`;
}

// İrsaliye kodu: IRS-2026-00001
async function irsaliyeKoduUret() {
  const yil = new Date().getFullYear();
  const satir = await tek(
    `SELECT COUNT(*)::int AS adet FROM manifests WHERE code LIKE $1`,
    [`IRS-${yil}-%`]
  );
  return `IRS-${yil}-${(satir.adet + 1).toString().padStart(5, '0')}`;
}

// Alıcının ilçesine bakarak hangi şubenin dağıtacağını buluyoruz.
// branches.districts alanı "Kadıköy,Ataşehir,Maltepe" gibi virgüllü metin.
async function subeBul(ilce) {
  const subeler = await sorgu(
    `SELECT id, code, name, districts FROM branches WHERE is_active = TRUE`
  );

  const aranan = ilce.trim().toLocaleLowerCase('tr');
  for (const sube of subeler) {
    const liste = sube.districts.split(',').map((d) => d.trim().toLocaleLowerCase('tr'));
    if (liste.includes(aranan)) return sube;
  }
  return null;
}

// Taşıma ücreti: taban ücret + desi başına ücret
function ucretHesapla(tacir, desi) {
  const taban = Number(tacir.base_price);
  const desiUcreti = Number(tacir.price_per_desi);
  const d = Number(desi) || 1;
  // İlk desi taban ücrete dahil
  const ekDesi = Math.max(0, Math.ceil(d) - 1);
  return taban + ekDesi * desiUcreti;
}

// 6 haneli teslimat doğrulama kodu
function otpUret() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hareket kaydı ekle
async function hareketEkle(shipmentId, durum, aciklama, subeId, kullaniciId) {
  await sorgu(
    `INSERT INTO shipment_events (shipment_id, status, description, branch_id, user_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [shipmentId, durum, aciklama, subeId || null, kullaniciId || null]
  );
}

// Yerel gün (UTC'ye çevirmeden) — gün sonu raporlarında şart
function yerelGun(tarih) {
  const d = tarih ? new Date(tarih) : new Date();
  const ay = String(d.getMonth() + 1).padStart(2, '0');
  const gun = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${ay}-${gun}`;
}

module.exports = {
  DURUMLAR, barkodUret, irsaliyeKoduUret, subeBul,
  ucretHesapla, otpUret, hareketEkle, yerelGun,
};
