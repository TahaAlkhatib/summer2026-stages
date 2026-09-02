export const ROL_ETIKETLERI = {
  admin: "Yönetici", kasiyer: "Kasiyer", antrenor: "Antrenör",
};

export const GUNLER = ["", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export function paraFormat(tutar) {
  return Number(tutar || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }) + " ₺";
}

export function tarihFormat(tarih) {
  if (!tarih) return "-";
  const s = String(tarih).slice(0, 10).split("-");
  if (s.length !== 3) return "-";
  return s[2] + "." + s[1] + "." + s[0];
}

export function tarihSaatFormat(tarih) {
  if (!tarih) return "-";
  const d = new Date(String(tarih).replace(" ", "T"));
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("tr-TR") + " " +
         d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

// Yerel gün (UTC kaymasını önlemek için)
export function yerelTarih(gunEkle) {
  const d = new Date();
  if (gunEkle) d.setDate(d.getDate() + gunEkle);
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

// Üyelik bitişine kalan gün
export function kalanGun(bitisTarihi) {
  if (!bitisTarihi) return null;
  const bitis = new Date(String(bitisTarihi).slice(0, 10) + "T00:00:00");
  const bugun = new Date(yerelTarih() + "T00:00:00");
  return Math.round((bitis - bugun) / (1000 * 60 * 60 * 24));
}
