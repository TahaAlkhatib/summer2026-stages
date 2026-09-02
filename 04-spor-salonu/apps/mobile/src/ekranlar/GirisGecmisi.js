import { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import api, { hataMesaji, tarihSaatFormat, RENKLER } from "../api";

const YONTEM_ETIKETLERI = { qr: "QR Kod", rfid: "RFID Kart", manuel: "Manuel" };

export default function GirisGecmisi() {
  const [liste, setListe] = useState([]);
  const [hata, setHata] = useState("");
  const [yenileniyor, setYenileniyor] = useState(false);
  const [ilkYukleme, setIlkYukleme] = useState(true);

  function yukle() {
    setYenileniyor(true);
    setHata("");
    api.get("/member-portal/checkins")
      .then((c) => setListe(c.data))
      .catch((e) => setHata(hataMesaji(e)))
      .finally(() => { setYenileniyor(false); setIlkYukleme(false); });
  }

  useEffect(() => { yukle(); }, []);

  if (ilkYukleme) {
    return (
      <View style={[stil.kapsayici, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={RENKLER.vurgu} />
      </View>
    );
  }

  return (
    <View style={stil.kapsayici}>
      {hata ? <Text style={stil.hata}>{hata}</Text> : null}

      <FlatList
        data={liste}
        keyExtractor={(item, i) => String(i)}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yukle} />}
        ListEmptyComponent={
          !yenileniyor && (
            <Text style={stil.bos}>Henüz giriş kaydınız bulunmuyor.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={stil.kart}>
            <View style={stil.ust}>
              <Text style={stil.tarih}>{tarihSaatFormat(item.created_at)}</Text>
              <View style={[
                stil.rozet,
                { backgroundColor: item.result === "izin" ? "#1f6f43" : "#7f1d1d" },
              ]}>
                <Text style={[
                  stil.rozetYazi,
                  { color: item.result === "izin" ? "#d3f9d8" : "#fecaca" },
                ]}>
                  {item.result === "izin" ? "Giriş Yapıldı" : "Reddedildi"}
                </Text>
              </View>
            </View>

            <Text style={stil.detay}>
              {item.gate_name || "Turnike"} · {YONTEM_ETIKETLERI[item.method] || item.method}
            </Text>

            {item.reject_reason ? (
              <Text style={stil.sebep}>{item.reject_reason}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan },
  kart: {
    backgroundColor: RENKLER.kart, borderRadius: 10, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: RENKLER.cizgi,
  },
  ust: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tarih: { color: RENKLER.yazi, fontSize: 15, fontWeight: "600" },
  rozet: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rozetYazi: { fontSize: 12, fontWeight: "600" },
  detay: { color: RENKLER.soluk, marginTop: 8, fontSize: 13 },
  sebep: { color: RENKLER.kirmizi, marginTop: 6, fontSize: 13 },
  bos: { color: RENKLER.soluk, textAlign: "center", marginTop: 50 },
  hata: {
    backgroundColor: "#3b1219", color: "#ffb3ba", padding: 14,
    borderRadius: 8, margin: 16,
  },
});
