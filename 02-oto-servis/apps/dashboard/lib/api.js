// API ile konuşan yardımcı fonksiyonlar
const TEMEL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5102/api";

function token() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function kullanici() {
  if (typeof window === "undefined") return null;
  const kayit = localStorage.getItem("user");
  return kayit ? JSON.parse(kayit) : null;
}

export function cikisYap() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/giris";
}

async function istek(yol, secenekler = {}) {
  const basliklar = { "Content-Type": "application/json" };
  const t = token();
  if (t) {
    basliklar.Authorization = "Bearer " + t;
  }

  const cevap = await fetch(TEMEL + yol, { ...secenekler, headers: basliklar });

  // Oturum düştüyse giriş sayfasına at
  if (cevap.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/giris";
    return null;
  }

  const metin = await cevap.text();
  let govde = null;
  try {
    govde = metin ? JSON.parse(metin) : null;
  } catch {
    throw new Error("Sunucudan beklenmeyen bir cevap geldi.");
  }

  if (!cevap.ok) {
    throw new Error((govde && govde.message) || "Bir hata oluştu.");
  }
  return govde;
}

export const api = {
  get: (yol) => istek(yol),
  post: (yol, govde) => istek(yol, { method: "POST", body: JSON.stringify(govde) }),
  put: (yol, govde) => istek(yol, { method: "PUT", body: JSON.stringify(govde || {}) }),
  del: (yol) => istek(yol, { method: "DELETE" }),
};

// ---- Biçimlendirme ----

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

export function tarihSaatFormat(tarih) {
  if (!tarih) return "-";
  const d = new Date(tarih);
  return d.toLocaleDateString("tr-TR") + " " +
         d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

// Bugünün tarihi (UTC değil, yerel gün)
export function yerelTarih() {
  const d = new Date();
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + ay + "-" + gun;
}

export const DURUM_ETIKETLERI = {
  acildi: "Açıldı",
  incelemede: "İncelemede",
  onay_bekliyor: "Onay Bekliyor",
  tamirde: "Tamirde",
  tamamlandi: "Tamamlandı",
  teslim_edildi: "Teslim Edildi",
  iptal: "İptal",
};

export const ONEM_ETIKETLERI = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
};
