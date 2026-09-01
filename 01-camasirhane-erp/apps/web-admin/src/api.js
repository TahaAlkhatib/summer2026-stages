import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Her isteğe token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// Oturum düşerse giriş sayfasına at
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function getUser() {
  const kayit = localStorage.getItem("user");
  return kayit ? JSON.parse(kayit) : null;
}

// API'den gelen Türkçe hata mesajını çıkarır
export function hataMesaji(err) {
  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  return "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.";
}

export default api;
