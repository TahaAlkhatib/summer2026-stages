// Uygulama genelinde kullanilan renkler ve yardimci fonksiyonlar
export const RENKLER = {
  ana: "#1e6091",
  arkaPlan: "#f4f6f8",
  kart: "#ffffff",
  yazi: "#212529",
  soluk: "#6c757d",
  cizgi: "#dee2e6",
  yesil: "#198754",
  kirmizi: "#dc3545",
};

export const DURUM_RENKLERI = {
  alindi: "#6c757d",
  yikamada: "#0d6efd",
  utude: "#fd7e14",
  hazir: "#198754",
  teslim_edildi: "#495057",
  iptal: "#dc3545",
};

export const GOREV_DURUM_ETIKETLERI = {
  bekliyor: "Bekliyor",
  yolda: "Yolda",
  tamamlandi: "Tamamlandı",
  basarisiz: "Başarısız",
};

export function paraFormat(tutar) {
  return Number(tutar).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " ₺";
}

export function tarihFormat(tarih) {
  if (!tarih) return "-";
  const d = new Date(tarih);
  const gun = String(d.getDate()).padStart(2, "0");
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  return gun + "." + ay + "." + d.getFullYear();
}

export function tarihSaatFormat(tarih) {
  if (!tarih) return "-";
  const d = new Date(tarih);
  const saat = String(d.getHours()).padStart(2, "0");
  const dakika = String(d.getMinutes()).padStart(2, "0");
  return tarihFormat(tarih) + " " + saat + ":" + dakika;
}
