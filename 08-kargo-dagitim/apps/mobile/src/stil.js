// Ortak renkler ve biçimlendirme

export const renkler = {
  lacivert: "#16324f",
  lacivertAcik: "#23507c",
  turuncu: "#e2711d",
  turuncuAcik: "#f08a3c",
  zemin: "#f3f5f7",
  beyaz: "#ffffff",
  metin: "#1f2933",
  soluk: "#6b7280",
  cizgi: "#e2e6ea",
  yesil: "#15803d",
  kirmizi: "#b91c1c",
};

export function para(tutar) {
  const sayi = Number(tutar) || 0;
  const tam = Math.floor(sayi);
  const kurus = Math.round((sayi - tam) * 100).toString().padStart(2, "0");

  const basamaklar = tam.toString().split("").reverse();
  const parcalar = [];
  for (let i = 0; i < basamaklar.length; i += 3) {
    parcalar.push(basamaklar.slice(i, i + 3).reverse().join(""));
  }
  return parcalar.reverse().join(".") + "," + kurus + " ₺";
}

export function tarihSaat(deger) {
  if (!deger) return "-";
  const d = new Date(deger);
  if (isNaN(d)) return "-";
  const iki = (s) => String(s).padStart(2, "0");
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${iki(d.getHours())}:${iki(d.getMinutes())}`;
}
