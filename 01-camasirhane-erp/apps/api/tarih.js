// Tarih yardımcıları.
//
// DİKKAT: new Date().toISOString() tarihi UTC'ye çevirir. Türkiye UTC+3
// olduğu için gece 00:00-03:00 arasında bir önceki günü verir ve gün sonu
// raporu yanlış çıkar. Bu yüzden gün başını/sonunu YEREL saate göre
// hesaplıyoruz.

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

// "2026-09-03" biçiminde yerel gün metni
function gunMetni(deger) {
  const d = gunBasi(deger);
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${ay}-${gun}`;
}

function ayBasi() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

module.exports = { gunBasi, gunSonu, gunMetni, ayBasi };
