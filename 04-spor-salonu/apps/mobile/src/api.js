import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Android emülatöründe bilgisayarın localhost adresi 10.0.2.2 olur.
// Gerçek bir telefonda bilgisayarın yerel IP adresini yazın.
const api = axios.create({
  baseURL: "http://10.0.2.2:3104/api",
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export async function oturumuKaydet(token, uye) {
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("uye", JSON.stringify(uye));
}

export async function oturumuGetir() {
  const token = await AsyncStorage.getItem("token");
  const uye = await AsyncStorage.getItem("uye");
  return token ? { token, uye: JSON.parse(uye) } : null;
}

export async function oturumuKapat() {
  await AsyncStorage.multiRemove(["token", "uye"]);
}

// API'den gelen Türkçe hata mesajını çıkarır
export function hataMesaji(err) {
  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  if (err.code === "ECONNABORTED") {
    return "Sunucu yanıt vermedi. Lütfen tekrar deneyin.";
  }
  return "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
}

// ---- Biçimlendirme ----

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

export const RENKLER = {
  arkaPlan: "#0f1419",
  kart: "#16202b",
  cizgi: "#2d3f4f",
  vurgu: "#ffb703",
  yazi: "#e6edf3",
  soluk: "#8b9bab",
  yesil: "#4ade80",
  kirmizi: "#f87171",
};

export default api;
