import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { api, oturumuKaydet } from "../api";
import { renkler } from "../stil";

export default function GirisEkrani({ onGiris }) {
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function girisYap() {
    setHata("");
    if (!kullaniciAdi.trim() || !sifre) {
      setHata("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    setBekliyor(true);
    try {
      const cevap = await api.post("/auth/login", {
        username: kullaniciAdi.trim(),
        password: sifre,
      });

      // Bu uygulama kuryeler için
      if (cevap.user.role !== "kurye") {
        setHata("Bu uygulama kuryeler içindir. Şube personeli masaüstü uygulamayı kullanmalıdır.");
        setBekliyor(false);
        return;
      }

      await oturumuKaydet(cevap.token, cevap.user);
      onGiris(cevap.user);
    } catch (e) {
      setHata(e.message);
      setBekliyor(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: renkler.lacivert }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={s.kaydirma}>
        <View style={s.kart}>
          <Text style={s.baslik}>Hızlı Kargo</Text>
          <Text style={s.altBaslik}>Kurye Dağıtım Uygulaması</Text>

          {hata ? <Text style={s.hata}>{hata}</Text> : null}

          <Text style={s.etiket}>Kullanıcı Adı</Text>
          <TextInput style={s.girdi} value={kullaniciAdi} onChangeText={setKullaniciAdi}
            autoCapitalize="none" autoCorrect={false} />

          <Text style={s.etiket}>Şifre</Text>
          <TextInput style={s.girdi} value={sifre} onChangeText={setSifre}
            secureTextEntry onSubmitEditing={girisYap} />

          <TouchableOpacity style={[s.dugme, bekliyor && { opacity: 0.6 }]}
            onPress={girisYap} disabled={bekliyor}>
            <Text style={s.dugmeYazi}>{bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}</Text>
          </TouchableOpacity>

          <Text style={s.ipucu}>Demo: kurye1 / 123456</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  kaydirma: { flexGrow: 1, justifyContent: "center", padding: 24 },
  kart: { backgroundColor: renkler.beyaz, borderRadius: 16, padding: 26 },
  baslik: { fontSize: 25, fontWeight: "bold", color: renkler.lacivert, textAlign: "center" },
  altBaslik: { fontSize: 14, color: renkler.turuncu, textAlign: "center",
    marginTop: 2, marginBottom: 22 },
  etiket: { fontSize: 13, color: renkler.soluk, marginBottom: 5 },
  girdi: {
    borderWidth: 1, borderColor: renkler.cizgi, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, marginBottom: 14, fontSize: 15,
  },
  dugme: { backgroundColor: renkler.turuncu, borderRadius: 10,
    paddingVertical: 14, alignItems: "center", marginTop: 6 },
  dugmeYazi: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  hata: { backgroundColor: "#fee2e2", color: "#991b1b", padding: 12,
    borderRadius: 10, marginBottom: 16, fontSize: 13 },
  ipucu: { textAlign: "center", color: renkler.soluk, fontSize: 12, marginTop: 16 },
});
