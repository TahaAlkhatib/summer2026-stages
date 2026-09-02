import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import api, { oturumuKaydet, hataMesaji, RENKLER } from "../api";

// Üyeler personel değildir; telefon numarası ve üye kodunun son 4 hanesi ile giriş yapar
export default function GirisEkrani({ onGiris }) {
  const [telefon, setTelefon] = useState("");
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function girisYap() {
    setHata("");
    setBekliyor(true);
    try {
      const cevap = await api.post("/auth/member-login", {
        phone: telefon.trim(),
        code: kod.trim(),
      });
      await oturumuKaydet(cevap.data.token, cevap.data.member);
      onGiris(cevap.data.member);
    } catch (err) {
      setHata(hataMesaji(err));
      setBekliyor(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={stil.kapsayici}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={stil.icerik}>
        <Text style={stil.marka}>SPOR SALONU</Text>
        <Text style={stil.altBaslik}>Üye uygulaması</Text>

        <View style={stil.kart}>
          {hata ? <Text style={stil.hata}>{hata}</Text> : null}

          <Text style={stil.etiket}>Telefon Numarası</Text>
          <TextInput
            style={stil.giris}
            value={telefon}
            onChangeText={setTelefon}
            placeholder="+90 535 401 11 21"
            placeholderTextColor="#5a6b7c"
            keyboardType="phone-pad"
            autoCorrect={false}
          />

          <Text style={stil.etiket}>Üye Kodu (son 4 hane)</Text>
          <TextInput
            style={stil.giris}
            value={kod}
            onChangeText={(t) => setKod(t.toUpperCase())}
            placeholder="Örn: 0001"
            placeholderTextColor="#5a6b7c"
            autoCapitalize="characters"
            onSubmitEditing={girisYap}
          />

          <TouchableOpacity style={stil.buton} onPress={girisYap} disabled={bekliyor}>
            <Text style={stil.butonYazi}>
              {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Text>
          </TouchableOpacity>

          <Text style={stil.ipucu}>Demo: +90 535 401 11 21 / 0001</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan },
  icerik: { flexGrow: 1, justifyContent: "center", padding: 24 },
  marka: {
    color: RENKLER.vurgu, fontSize: 30, fontWeight: "900",
    textAlign: "center", letterSpacing: 2,
  },
  altBaslik: { color: RENKLER.soluk, textAlign: "center", marginTop: 6, marginBottom: 34 },
  kart: {
    backgroundColor: RENKLER.kart, borderRadius: 12, padding: 26,
    borderWidth: 1, borderColor: RENKLER.cizgi,
  },
  etiket: { color: "#c3cfdb", fontWeight: "600", marginBottom: 6, fontSize: 13 },
  giris: {
    backgroundColor: RENKLER.arkaPlan, borderWidth: 1, borderColor: RENKLER.cizgi,
    borderRadius: 8, padding: 14, marginBottom: 18, fontSize: 16, color: RENKLER.yazi,
  },
  buton: { backgroundColor: RENKLER.vurgu, padding: 16, borderRadius: 8, marginTop: 4 },
  butonYazi: { color: "#16202b", textAlign: "center", fontSize: 16, fontWeight: "700" },
  hata: {
    backgroundColor: "#3b1219", color: "#ffb3ba", padding: 12,
    borderRadius: 8, marginBottom: 18,
  },
  ipucu: { color: RENKLER.soluk, textAlign: "center", marginTop: 18, fontSize: 12 },
});
