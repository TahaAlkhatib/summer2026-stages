import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import api, { saveSession, hataMesaji } from "../api";
import { RENKLER } from "../stil";

export default function LoginScreen({ navigation }) {
  const [kullanici, setKullanici] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function girisYap() {
    setHata("");
    setBekliyor(true);
    try {
      const cevap = await api.post("/auth/login", {
        username: kullanici,
        password: sifre,
      });

      // Bu uygulama sadece kuryeler için
      if (cevap.data.user.role !== "kurye") {
        setHata("Bu uygulama sadece kuryeler içindir.");
        setBekliyor(false);
        return;
      }

      await saveSession(cevap.data.token, cevap.data.user);
      navigation.replace("CourierTasks");
    } catch (err) {
      setHata(hataMesaji(err));
    }
    setBekliyor(false);
  }

  return (
    <View style={stil.kapsayici}>
      {hata ? <Text style={stil.hata}>{hata}</Text> : null}

      <Text style={stil.etiket}>Kullanıcı Adı</Text>
      <TextInput
        style={stil.giris}
        value={kullanici}
        onChangeText={setKullanici}
        autoCapitalize="none"
      />

      <Text style={stil.etiket}>Şifre</Text>
      <TextInput
        style={stil.giris}
        value={sifre}
        onChangeText={setSifre}
        secureTextEntry
      />

      <TouchableOpacity style={stil.buton} onPress={girisYap} disabled={bekliyor}>
        <Text style={stil.butonYazi}>{bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}</Text>
      </TouchableOpacity>

      <Text style={stil.ipucu}>Demo: kurye1 / 123456</Text>
    </View>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan, padding: 24 },
  etiket: { fontWeight: "600", marginBottom: 6, color: RENKLER.yazi },
  giris: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: RENKLER.cizgi,
    borderRadius: 6,
    padding: 12,
    marginBottom: 18,
    fontSize: 15,
  },
  buton: { backgroundColor: RENKLER.ana, padding: 15, borderRadius: 6, marginTop: 6 },
  butonYazi: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "600" },
  hata: {
    backgroundColor: "#f8d7da",
    color: "#842029",
    padding: 12,
    borderRadius: 6,
    marginBottom: 18,
  },
  ipucu: { color: RENKLER.soluk, textAlign: "center", marginTop: 20, fontSize: 13 },
});
