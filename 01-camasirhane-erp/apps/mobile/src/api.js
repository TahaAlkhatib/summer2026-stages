import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Android emulatorunde bilgisayarin localhost adresi 10.0.2.2 olur
const api = axios.create({
  baseURL: "http://10.0.2.2:3101/api",
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export async function saveSession(token, user) {
  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

export async function getSession() {
  const token = await AsyncStorage.getItem("token");
  const user = await AsyncStorage.getItem("user");
  return token ? { token: token, user: JSON.parse(user) } : null;
}

export async function clearSession() {
  await AsyncStorage.multiRemove(["token", "user"]);
}

// API'den gelen Türkçe hata mesajını çıkarır
export function hataMesaji(err) {
  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  return "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
}

export default api;
