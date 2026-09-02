// Ekranda gosterilen degerlerin Turkce bicimlendirilmesi

export function para(tutar) {
  const sayi = Number(tutar) || 0;
  return sayi.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

// "2026-09-02" -> "02.09.2026"
export function tarih(metin) {
  if (!metin) return "-";
  const parcalar = String(metin).slice(0, 10).split("-");
  if (parcalar.length !== 3) return "-";
  return `${parcalar[2]}.${parcalar[1]}.${parcalar[0]}`;
}

export function tarihSaat(deger) {
  if (!deger) return "-";
  const d = new Date(deger);
  if (isNaN(d)) return "-";
  return d.toLocaleString("tr-TR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export const REZERVASYON_DURUMLARI = {
  onaylandi: { etiket: "Onaylandı", renk: "bg-blue-100 text-blue-800" },
  giris_yapildi: { etiket: "İçeride", renk: "bg-green-100 text-green-800" },
  cikis_yapildi: { etiket: "Çıkış yapıldı", renk: "bg-gray-200 text-gray-700" },
  iptal: { etiket: "İptal", renk: "bg-red-100 text-red-800" },
};

export const ODA_DURUMLARI = {
  musait: { etiket: "Müsait", renk: "bg-green-100 text-green-800" },
  dolu: { etiket: "Dolu", renk: "bg-blue-100 text-blue-800" },
  temizlik: { etiket: "Temizlik bekliyor", renk: "bg-amber-100 text-amber-800" },
  bakim: { etiket: "Bakımda", renk: "bg-red-100 text-red-800" },
};

export const GOREV_DURUMLARI = {
  bekliyor: { etiket: "Bekliyor", renk: "bg-amber-100 text-amber-800" },
  basladi: { etiket: "Başladı", renk: "bg-blue-100 text-blue-800" },
  tamamlandi: { etiket: "Tamamlandı", renk: "bg-green-100 text-green-800" },
  iptal: { etiket: "İptal", renk: "bg-gray-200 text-gray-700" },
};

export const MASRAF_TURLERI = {
  konaklama: "Konaklama",
  kahvalti: "Kahvaltı",
  minibar: "Minibar",
  otopark: "Otopark",
  camasir: "Çamaşırhane",
  hasar: "Hasar bedeli",
  diger: "Diğer",
};

export const ODEME_YONTEMLERI = {
  nakit: "Nakit",
  kredi_karti: "Kredi Kartı",
  havale: "Havale / EFT",
};

export const KANALLAR = {
  telefon: "Telefon",
  walkin: "Kapıdan",
  internet: "İnternet",
};

// Yerel gun metni — new Date().toISOString() UTC'ye cevirip gunu kaydiriyor,
// bu yuzden elle olusturuyoruz.
export function gunMetni(d) {
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${ay}-${gun}`;
}

export function gunEkle(metin, adet) {
  const d = new Date(metin + "T00:00:00");
  d.setDate(d.getDate() + adet);
  return gunMetni(d);
}

export function gunFarki(a, b) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

const GUN_ADLARI = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const AY_ADLARI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function gunAdi(metin) {
  return GUN_ADLARI[new Date(metin + "T00:00:00").getDay()];
}

export function ayAdi(metin) {
  return AY_ADLARI[new Date(metin + "T00:00:00").getMonth()];
}

export function haftaSonuMu(metin) {
  const g = new Date(metin + "T00:00:00").getDay();
  return g === 0 || g === 6;
}
