// Sipariş durumlarının Türkçe karşılıkları — tüm sayfalarda kullanılır
export const DURUM_ETIKETLERI = {
  alindi: "Teslim Alındı",
  yikamada: "Yıkamada",
  utude: "Ütüde",
  hazir: "Hazır",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

export function DurumRozeti({ durum }) {
  return <span className={"rozet " + durum}>{DURUM_ETIKETLERI[durum]}</span>;
}

// 1234.5 -> "1.234,50 ₺"
export function paraFormat(tutar) {
  return Number(tutar).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " ₺";
}

// "2026-09-02T10:30:00" -> "02.09.2026"
export function tarihFormat(tarih) {
  if (!tarih) return "-";
  return new Date(tarih).toLocaleDateString("tr-TR");
}

// "2026-09-02T10:30:00" -> "02.09.2026 10:30"
export function tarihSaatFormat(tarih) {
  if (!tarih) return "-";
  const d = new Date(tarih);
  return d.toLocaleDateString("tr-TR") + " " + d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

// Bugunun tarihini YYYY-AA-GG olarak verir.
// new Date().toISOString() UTC tarihini dondurdugu icin Turkiye'de (UTC+3)
// gece yarisindan sonra bir onceki gunu gosteriyordu; bu yuzden yerel
// gun/ay/yil bilesenlerini kullaniyoruz.
export function yerelTarih(gunEkle) {
  const d = new Date();
  if (gunEkle) {
    d.setDate(d.getDate() + gunEkle);
  }
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + ay + "-" + gun;
}
