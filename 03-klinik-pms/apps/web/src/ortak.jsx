// Ortak etiketler ve biçimlendirme yardımcıları

export const RANDEVU_DURUMLARI = {
  planlandi: "Planlandı",
  geldi: "Geldi",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
  gelmedi: "Gelmedi",
};

export const ROL_ETIKETLERI = {
  admin: "Yönetici",
  resepsiyon: "Resepsiyon",
  doktor: "Doktor",
};

export const CINSIYET_ETIKETLERI = { kadin: "Kadın", erkek: "Erkek" };

export function DurumRozeti({ durum }) {
  return <span className={"rozet " + durum}>{RANDEVU_DURUMLARI[durum] || durum}</span>;
}

export function paraFormat(tutar) {
  return Number(tutar || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " ₺";
}

export function tarihFormat(tarih) {
  if (!tarih) return "-";
  return new Date(tarih).toLocaleDateString("tr-TR");
}

export function saatFormat(tarih) {
  if (!tarih) return "-";
  return new Date(tarih).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function tarihSaatFormat(tarih) {
  if (!tarih) return "-";
  return tarihFormat(tarih) + " " + saatFormat(tarih);
}

// Bugünün tarihi — UTC kaymasını önlemek için yerel bileşenlerden üretilir
export function yerelTarih(gunEkle) {
  const d = new Date();
  if (gunEkle) d.setDate(d.getDate() + gunEkle);
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + ay + "-" + gun;
}

// Doğum tarihinden yaş hesaplar
export function yasHesapla(dogumTarihi) {
  if (!dogumTarihi) return "-";
  const d = new Date(dogumTarihi);
  const bugun = new Date();
  let yas = bugun.getFullYear() - d.getFullYear();
  const ayFarki = bugun.getMonth() - d.getMonth();
  if (ayFarki < 0 || (ayFarki === 0 && bugun.getDate() < d.getDate())) {
    yas--;
  }
  return yas + " yaş";
}
