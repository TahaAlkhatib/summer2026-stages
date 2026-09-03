const Shipment = require('./models/Shipment');
const Manifest = require('./models/Manifest');
const Branch = require('./models/Branch');
const ShipmentEvent = require('./models/ShipmentEvent');

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
  const adet = await Shipment.countDocuments({ barcode: new RegExp('^KRG' + yil) });
  return 'KRG' + yil + (adet + 1).toString().padStart(6, '0');
}

// İrsaliye kodu: IRS-2026-00001
async function irsaliyeKoduUret() {
  const yil = new Date().getFullYear();
  const adet = await Manifest.countDocuments({ code: new RegExp('^IRS-' + yil + '-') });
  return 'IRS-' + yil + '-' + (adet + 1).toString().padStart(5, '0');
}

// Alıcının ilçesine bakarak hangi şubenin dağıtacağını buluyoruz.
// branches.districts alanı "Kadıköy,Ataşehir,Maltepe" gibi virgüllü metin.
async function subeBul(ilce) {
  const subeler = await Branch.find({ is_active: true });

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
async function hareketEkle(gonderiId, durum, aciklama, subeId, kullaniciId) {
  await ShipmentEvent.create({
    shipment_id: gonderiId,
    status: durum,
    description: aciklama,
    branch_id: subeId || null,
    user_id: kullaniciId || null,
  });
}

// Yerel gün sınırları.
// DİKKAT: toISOString() UTC'ye çevirir; Türkiye UTC+3 olduğu için gece
// 00:00-03:00 arasında bir önceki günü verir ve raporlar kayar.
function gunBasi(deger) {
  const d = deger ? new Date(deger) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function gunSonu(deger) {
  const d = gunBasi(deger);
  d.setDate(d.getDate() + 1);
  return d;
}

function yerelGun(tarih) {
  const d = gunBasi(tarih);
  const ay = String(d.getMonth() + 1).padStart(2, '0');
  const gun = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${ay}-${gun}`;
}

function ayBasi() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

module.exports = {
  DURUMLAR, barkodUret, irsaliyeKoduUret, subeBul,
  ucretHesapla, otpUret, hareketEkle,
  gunBasi, gunSonu, yerelGun, ayBasi,
};
