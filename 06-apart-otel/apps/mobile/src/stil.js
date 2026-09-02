// Ortak renkler ve bicimlendirme yardimcilari

export const renkler = {
  ana: "#1b3a4b",
  anaAcik: "#285a72",
  vurgu: "#c1662f",
  vurguAcik: "#e08a4f",
  zemin: "#f7f4ef",
  beyaz: "#ffffff",
  metin: "#1f2933",
  soluk: "#7b8794",
  cizgi: "#e4e7eb",
  yesil: "#15803d",
  kirmizi: "#b91c1c",
  turuncu: "#b45309",
  mavi: "#1d4ed8",
};

export const GOREV_DURUMLARI = {
  bekliyor: { etiket: "Bekliyor", renk: "#b45309", zemin: "#fef3c7" },
  basladi: { etiket: "Devam ediyor", renk: "#1d4ed8", zemin: "#dbeafe" },
  tamamlandi: { etiket: "Tamamlandı", renk: "#15803d", zemin: "#dcfce7" },
  iptal: { etiket: "İptal", renk: "#6b7280", zemin: "#e5e7eb" },
};

export function gorevTuru(tur) {
  return tur === "bakim" ? "Bakım" : "Temizlik";
}

export function oncelikEtiketi(oncelik) {
  if (oncelik === "acil") return "ACİL";
  if (oncelik === "dusuk") return "Düşük";
  return "Normal";
}

export function tarihSaat(deger) {
  if (!deger) return "-";
  const d = new Date(deger);
  if (isNaN(d)) return "-";
  const iki = (s) => String(s).padStart(2, "0");
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${iki(d.getHours())}:${iki(d.getMinutes())}`;
}

// "3 saat önce" gibi kisa bir ifade — sahada daha anlasilir
export function gecenSure(deger) {
  if (!deger) return "";
  const fark = Date.now() - new Date(deger).getTime();
  const dakika = Math.floor(fark / 60000);
  if (dakika < 1) return "az önce";
  if (dakika < 60) return dakika + " dakika önce";
  const saat = Math.floor(dakika / 60);
  if (saat < 24) return saat + " saat önce";
  return Math.floor(saat / 24) + " gün önce";
}
