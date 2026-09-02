import AsyncStorage from "@react-native-async-storage/async-storage";

// Android emülatöründe bilgisayarın localhost adresi 10.0.2.2 olur.
// Gerçek bir telefonda bilgisayarın yerel IP adresini yazın.
export const TEMEL_ADRES = "http://10.0.2.2:3108/api";

let token = null;
let kullanici = null;

export function oturumBilgisi() {
  return kullanici;
}

export async function oturumuYukle() {
  token = await AsyncStorage.getItem("token");
  const metin = await AsyncStorage.getItem("kullanici");
  kullanici = metin ? JSON.parse(metin) : null;
  return kullanici;
}

export async function oturumuKaydet(yeniToken, yeniKullanici) {
  token = yeniToken;
  kullanici = yeniKullanici;
  await AsyncStorage.setItem("token", yeniToken);
  await AsyncStorage.setItem("kullanici", JSON.stringify(yeniKullanici));
}

export async function oturumuKapat() {
  token = null;
  kullanici = null;
  await AsyncStorage.multiRemove(["token", "kullanici"]);
}

async function istek(yol, ayarlar = {}) {
  const basliklar = { "Content-Type": "application/json" };
  if (token) basliklar.Authorization = "Bearer " + token;

  // Sunucu kapalıysa fetch çok uzun bekleyebiliyor, süre sınırı koyuyoruz
  const kontrol = new AbortController();
  const zamanlayici = setTimeout(() => kontrol.abort(), 20000);

  let cevap;
  try {
    cevap = await fetch(TEMEL_ADRES + yol, {
      ...ayarlar,
      headers: basliklar,
      signal: kontrol.signal,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Sunucu yanıt vermedi. Lütfen tekrar deneyin.");
    }
    throw new Error("Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.");
  } finally {
    clearTimeout(zamanlayici);
  }

  const metin = await cevap.text();
  let govde = null;
  if (metin) {
    try {
      govde = JSON.parse(metin);
    } catch (e) {
      throw new Error("Sunucudan beklenmeyen bir cevap geldi.");
    }
  }

  if (!cevap.ok) {
    throw new Error((govde && govde.message) || "Bir hata oluştu.");
  }
  return govde;
}

export const api = {
  get: (yol) => istek(yol),
  post: (yol, govde) => istek(yol, { method: "POST", body: JSON.stringify(govde || {}) }),
};
