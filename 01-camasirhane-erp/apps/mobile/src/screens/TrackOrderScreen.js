import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";
import api, { hataMesaji } from "../api";
import { RENKLER, DURUM_RENKLERI, tarihFormat, tarihSaatFormat } from "../stil";

export default function TrackOrderScreen() {
  const [kod, setKod] = useState("");
  const [siparis, setSiparis] = useState(null);
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function sorgula() {
    if (!kod.trim()) {
      setHata("Lütfen sipariş numarası girin.");
      setSiparis(null);
      return;
    }

    setHata("");
    setBekliyor(true);
    try {
      const cevap = await api.get("/track/" + kod.trim());
      setSiparis(cevap.data);
    } catch (err) {
      setHata(hataMesaji(err));
      setSiparis(null);
    }
    setBekliyor(false);
  }

  return (
    <ScrollView style={stil.kapsayici}>
      <Text style={stil.aciklama}>
        Sipariş numaranızı veya etiket barkodunuzu girin.
      </Text>

      <TextInput
        style={stil.giris}
        value={kod}
        onChangeText={setKod}
        placeholder="SP-2026-00001"
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <TouchableOpacity style={stil.buton} onPress={sorgula} disabled={bekliyor}>
        <Text style={stil.butonYazi}>{bekliyor ? "Sorgulanıyor..." : "Sorgula"}</Text>
      </TouchableOpacity>

      {hata ? <Text style={stil.hata}>{hata}</Text> : null}

      {siparis && (
        <View>
          <View style={stil.kart}>
            <Text style={stil.siparisNo}>{siparis.order_no}</Text>

            <View style={[stil.rozet, { backgroundColor: DURUM_RENKLERI[siparis.status] }]}>
              <Text style={stil.rozetYazi}>{siparis.status_label}</Text>
            </View>

            <View style={stil.satir}>
              <Text style={stil.satirEtiket}>Müşteri</Text>
              <Text style={stil.satirDeger}>{siparis.customer_name}</Text>
            </View>
            <View style={stil.satir}>
              <Text style={stil.satirEtiket}>Söz Verilen Teslim</Text>
              <Text style={stil.satirDeger}>{tarihFormat(siparis.promised_date)}</Text>
            </View>
            <View style={stil.satir}>
              <Text style={stil.satirEtiket}>Parça Sayısı</Text>
              <Text style={stil.satirDeger}>{siparis.item_count}</Text>
            </View>
          </View>

          <View style={stil.kart}>
            <Text style={stil.kartBaslik}>Sipariş Aşamaları</Text>

            {siparis.history.map((asama, i) => {
              const sonuncu = i === siparis.history.length - 1;
              return (
                <View key={i} style={stil.asamaSatir}>
                  <View
                    style={[
                      stil.nokta,
                      { backgroundColor: sonuncu ? DURUM_RENKLERI[asama.status] : RENKLER.cizgi },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[stil.asamaAd, sonuncu && { fontWeight: "bold" }]}>
                      {asama.status_label}
                    </Text>
                    <Text style={stil.asamaTarih}>{tarihSaatFormat(asama.changed_at)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan, padding: 16 },
  aciklama: { color: RENKLER.soluk, marginBottom: 14, fontSize: 14 },
  giris: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: RENKLER.cizgi,
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  buton: { backgroundColor: RENKLER.ana, padding: 15, borderRadius: 6 },
  butonYazi: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "600" },
  hata: {
    backgroundColor: "#f8d7da",
    color: "#842029",
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  kart: { backgroundColor: "#fff", borderRadius: 8, padding: 16, marginTop: 16, elevation: 2 },
  siparisNo: { fontSize: 22, fontWeight: "bold", color: RENKLER.yazi },
  rozet: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 14,
  },
  rozetYazi: { color: "#fff", fontWeight: "600" },
  satir: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  satirEtiket: { color: RENKLER.soluk },
  satirDeger: { fontWeight: "600" },
  kartBaslik: { fontSize: 15, fontWeight: "bold", color: RENKLER.ana, marginBottom: 14 },
  asamaSatir: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  nokta: { width: 12, height: 12, borderRadius: 6, marginTop: 3, marginRight: 12 },
  asamaAd: { fontSize: 15, color: RENKLER.yazi },
  asamaTarih: { color: RENKLER.soluk, fontSize: 12, marginTop: 2 },
});
