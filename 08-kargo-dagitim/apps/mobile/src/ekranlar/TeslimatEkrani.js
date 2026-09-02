import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from "react-native";
import { api } from "../api";
import { renkler, para } from "../stil";
import ImzaAlani from "../ImzaAlani";

export default function TeslimatEkrani({ gonderi, onGeri, onTamamlandi }) {
  const [otp, setOtp] = useState("");
  const [teslimAlan, setTeslimAlan] = useState("");
  const [not, setNot] = useState("");
  const [imza, setImza] = useState("");
  const [odemeYontemi, setOdemeYontemi] = useState("nakit");
  const [hata, setHata] = useState("");
  const [islemde, setIslemde] = useState(false);

  const kapidaOdeme = Number(gonderi.cod_amount) > 0;

  // Demo kolaylığı: gerçekte kod alıcıya SMS ile gider
  async function kodGoster() {
    try {
      const cevap = await api.get(`/delivery/${gonderi.id}/otp`);
      Alert.alert(
        "Teslimat Kodu (Demo)",
        `Kod: ${cevap.otp}\n\n${cevap.note}`,
        [{ text: "Alana Yaz", onPress: () => setOtp(cevap.otp) }, { text: "Kapat" }]
      );
    } catch (e) {
      setHata(e.message);
    }
  }

  async function teslimEt() {
    setHata("");

    if (otp.trim().length !== 6) {
      setHata("Teslimat kodu 6 haneli olmalıdır.");
      return;
    }
    if (!teslimAlan.trim()) {
      setHata("Teslim alan kişinin adını yazın.");
      return;
    }
    if (!imza) {
      setHata("Alıcı imzası alınmalıdır.");
      return;
    }

    setIslemde(true);
    try {
      const cevap = await api.post(`/delivery/${gonderi.id}/deliver`, {
        otp: otp.trim(),
        deliveredTo: teslimAlan.trim(),
        signature: imza,
        note: not,
        codMethod: odemeYontemi,
      });

      Alert.alert("Teslimat Tamamlandı", cevap.message, [
        { text: "Tamam", onPress: () => { onTamamlandi(); onGeri(); } },
      ]);
    } catch (e) {
      setHata(e.message);
      setIslemde(false);
    }
  }

  async function teslimEdilemedi() {
    if (!not.trim()) {
      setHata("Teslim edilememe sebebini not alanına yazın.");
      return;
    }

    setIslemde(true);
    try {
      const cevap = await api.post(`/delivery/${gonderi.id}/fail`, { reason: not.trim() });
      Alert.alert("Kaydedildi", cevap.message, [
        { text: "Tamam", onPress: () => { onTamamlandi(); onGeri(); } },
      ]);
    } catch (e) {
      setHata(e.message);
      setIslemde(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: renkler.zemin }}>
      <View style={s.ustBar}>
        <TouchableOpacity onPress={onGeri}>
          <Text style={s.geri}>‹ Rotam</Text>
        </TouchableOpacity>
        <Text style={s.barkod}>{gonderi.barcode}</Text>
        <Text style={s.altBaslik}>{gonderi.receiver_district}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        {hata ? <Text style={s.hata}>{hata}</Text> : null}

        <View style={s.kart}>
          <Text style={s.kartBaslik}>Alıcı</Text>
          <Text style={s.aliciAd}>{gonderi.receiver_name}</Text>
          <Text style={s.soluk}>{gonderi.receiver_phone}</Text>
          <Text style={s.adres}>{gonderi.receiver_address}</Text>
          <Text style={s.soluk}>Gönderici: {gonderi.company_name}</Text>
        </View>

        {kapidaOdeme && (
          <View style={s.kapidaKutu}>
            <Text style={s.kapidaBaslik}>KAPIDA ÖDEME</Text>
            <Text style={s.kapidaTutar}>{para(gonderi.cod_amount)}</Text>
            <Text style={s.kapidaAlt}>Teslimden önce tahsil edin</Text>

            <View style={s.yontemSatiri}>
              {[["nakit", "Nakit"], ["kredi_karti", "Kredi Kartı"]].map(([deger, etiket]) => (
                <TouchableOpacity key={deger}
                  style={[s.yontem, odemeYontemi === deger && s.yontemSecili]}
                  onPress={() => setOdemeYontemi(deger)}>
                  <Text style={[s.yontemYazi, odemeYontemi === deger && s.yontemYaziSecili]}>
                    {etiket}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={s.kart}>
          <Text style={s.kartBaslik}>Teslimat Kodu</Text>
          <Text style={s.soluk}>Alıcıya gelen 6 haneli kodu girin.</Text>

          <TextInput
            style={s.otpGirdi}
            value={otp}
            onChangeText={(m) => setOtp(m.replace(/[^0-9]/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
          />

          <TouchableOpacity onPress={kodGoster}>
            <Text style={s.kodGoster}>Kodu göster (demo)</Text>
          </TouchableOpacity>
        </View>

        <View style={s.kart}>
          <Text style={s.kartBaslik}>Teslim Alan</Text>
          <TextInput
            style={s.girdi}
            value={teslimAlan}
            onChangeText={setTeslimAlan}
            placeholder="Ad soyad (alıcı, komşu, kapıcı...)"
          />
        </View>

        <View style={s.kart}>
          <Text style={s.kartBaslik}>Alıcı İmzası</Text>
          <ImzaAlani onDegisti={setImza} />
        </View>

        <View style={s.kart}>
          <Text style={s.kartBaslik}>Not</Text>
          <TextInput
            style={[s.girdi, { height: 70, textAlignVertical: "top" }]}
            value={not}
            onChangeText={setNot}
            multiline
            placeholder="Teslim notu veya teslim edilememe sebebi"
          />
        </View>

        <TouchableOpacity
          style={[s.dugme, { backgroundColor: renkler.yesil }, islemde && { opacity: 0.6 }]}
          onPress={teslimEt}
          disabled={islemde}
        >
          <Text style={s.dugmeYazi}>
            {kapidaOdeme ? `Tahsil Et ve Teslim Et` : "Teslim Et"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.dugme, s.dugmeTehlike, islemde && { opacity: 0.6 }]}
          onPress={teslimEdilemedi}
          disabled={islemde}
        >
          <Text style={[s.dugmeYazi, { color: renkler.kirmizi }]}>Teslim Edilemedi</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  ustBar: { backgroundColor: renkler.lacivert, paddingTop: 50,
    paddingBottom: 14, paddingHorizontal: 16 },
  geri: { color: "#a8c0d4", fontSize: 15, marginBottom: 6 },
  barkod: { color: "#fff", fontSize: 21, fontWeight: "bold", fontFamily: "monospace" },
  altBaslik: { color: "#a8c0d4", fontSize: 13, marginTop: 2 },

  kart: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: renkler.cizgi },
  kartBaslik: { fontWeight: "bold", color: renkler.lacivert, marginBottom: 8 },
  aliciAd: { fontSize: 17, fontWeight: "600" },
  soluk: { color: renkler.soluk, fontSize: 13 },
  adres: { fontSize: 14, marginVertical: 6 },

  kapidaKutu: { backgroundColor: "#fff7ed", borderWidth: 2, borderColor: renkler.turuncu,
    borderRadius: 12, padding: 14, marginBottom: 12, alignItems: "center" },
  kapidaBaslik: { color: "#c2410c", fontWeight: "bold", fontSize: 12, letterSpacing: 1 },
  kapidaTutar: { fontSize: 30, fontWeight: "bold", color: "#c2410c", marginVertical: 4 },
  kapidaAlt: { color: "#9a3412", fontSize: 12 },
  yontemSatiri: { flexDirection: "row", gap: 10, marginTop: 12 },
  yontem: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: renkler.turuncu, backgroundColor: "#fff" },
  yontemSecili: { backgroundColor: renkler.turuncu },
  yontemYazi: { color: "#c2410c", fontWeight: "600" },
  yontemYaziSecili: { color: "#fff" },

  girdi: { borderWidth: 1, borderColor: renkler.cizgi, borderRadius: 10,
    padding: 12, fontSize: 15 },
  otpGirdi: { borderWidth: 2, borderColor: renkler.lacivertAcik, borderRadius: 10,
    padding: 12, fontSize: 26, letterSpacing: 10, textAlign: "center",
    fontFamily: "monospace", marginTop: 8 },
  kodGoster: { color: renkler.lacivertAcik, textAlign: "center",
    marginTop: 10, fontSize: 13 },

  dugme: { borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 10 },
  dugmeYazi: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  dugmeTehlike: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0c4c4" },

  hata: { backgroundColor: "#fee2e2", color: "#991b1b", padding: 12,
    borderRadius: 10, marginBottom: 12, fontSize: 13 },
});
