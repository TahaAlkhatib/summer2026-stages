import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3103/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export function getUser() {
  const kayit = localStorage.getItem("user");
  return kayit ? JSON.parse(kayit) : null;
}

export function hataMesaji(err) {
  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  return "Sunucuya bağlanılamadı. API çalışıyor mu?";
}

export function paraFormat(tutar) {
  return Number(tutar || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }) + " ₺";
}

export function saatFormat(tarih) {
  if (!tarih) return "-";
  return new Date(tarih).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function tarihFormat(tarih) {
  if (!tarih) return "-";
  return new Date(tarih).toLocaleDateString("tr-TR");
}

// Yerel gün (UTC kaymasını önlemek için)
export function yerelTarih() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

export const RANDEVU_DURUMLARI = {
  planlandi: "Planlandı",
  geldi: "Geldi",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
  gelmedi: "Gelmedi",
};

export default api;
