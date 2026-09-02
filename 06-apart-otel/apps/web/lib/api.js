// API'ye giden butun istekler buradan gecer.
// Token tarayicinin localStorage'inda saklanir.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3106/api";

export function tokenAl() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function kullaniciAl() {
  if (typeof window === "undefined") return null;
  const metin = localStorage.getItem("kullanici");
  return metin ? JSON.parse(metin) : null;
}

export function oturumKaydet(token, kullanici) {
  localStorage.setItem("token", token);
  localStorage.setItem("kullanici", JSON.stringify(kullanici));
}

export function oturumKapat() {
  localStorage.removeItem("token");
  localStorage.removeItem("kullanici");
}

async function istek(yol, ayarlar = {}) {
  const basliklar = { "Content-Type": "application/json" };
  const token = tokenAl();
  if (token) basliklar.Authorization = "Bearer " + token;

  let cevap;
  try {
    cevap = await fetch(API_URL + yol, { ...ayarlar, headers: basliklar });
  } catch (e) {
    throw new Error("Sunucuya bağlanılamadı. API çalışıyor mu?");
  }

  let govde = null;
  const metin = await cevap.text();
  if (metin) {
    try {
      govde = JSON.parse(metin);
    } catch (e) {
      throw new Error("Sunucudan beklenmeyen bir cevap geldi.");
    }
  }

  if (!cevap.ok) {
    // Oturum dustuyse giris ekranina yolla
    if (cevap.status === 401 && typeof window !== "undefined") {
      oturumKapat();
      window.location.href = "/giris";
    }
    throw new Error((govde && govde.message) || "Bir hata oluştu.");
  }

  return govde;
}

export const api = {
  get: (yol) => istek(yol),
  post: (yol, govde) => istek(yol, { method: "POST", body: JSON.stringify(govde || {}) }),
  put: (yol, govde) => istek(yol, { method: "PUT", body: JSON.stringify(govde || {}) }),
};
