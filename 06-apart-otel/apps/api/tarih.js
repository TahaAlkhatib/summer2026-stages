// Tarih yardimcilari.
//
// DIKKAT: Rezervasyon tarihlerinde saat onemli degil, gun onemli.
// new Date().toISOString() UTC'ye cevirir; Turkiye UTC+3 oldugu icin
// gece 00:00-03:00 arasinda bir onceki gunu verir. Bu yuzden gun basini
// her zaman YEREL saate gore hesapliyoruz.

function gunBasi(deger) {
  const d = new Date(deger);
  d.setHours(0, 0, 0, 0);
  return d;
}

function bugun() {
  return gunBasi(new Date());
}

function gunEkle(tarih, adet) {
  const d = gunBasi(tarih);
  d.setDate(d.getDate() + adet);
  return d;
}

// Iki tarih arasindaki gece sayisi
function geceSayisi(giris, cikis) {
  const fark = gunBasi(cikis).getTime() - gunBasi(giris).getTime();
  return Math.round(fark / (1000 * 60 * 60 * 24));
}

// "2026-09-05" seklinde yerel gun metni (UTC kaymasi olmadan)
function gunMetni(tarih) {
  const d = gunBasi(tarih);
  const ay = String(d.getMonth() + 1).padStart(2, '0');
  const gun = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${ay}-${gun}`;
}

module.exports = { gunBasi, bugun, gunEkle, geceSayisi, gunMetni };
