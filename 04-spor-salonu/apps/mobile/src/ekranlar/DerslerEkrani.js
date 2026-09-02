import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import api, { hataMesaji, tarihFormat, RENKLER } from "../api";

export default function DerslerEkrani() {
  const [veri, setVeri] = useState(null);
  const [hata, setHata] = useState("");
  const [yenileniyor, setYenileniyor] = useState(false);

  function yukle() {
    setYenileniyor(true);
    setHata("");
    api.get("/member-portal/classes")
      .then((c) => setVeri(c.data))
      .catch((e) => setHata(hataMesaji(e)))
      .finally(() => setYenileniyor(false));
  }

  useEffect(() => { yukle(); }, []);

  if (!veri && !hata) {
    return (
      <View style={[stil.kapsayici, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={RENKLER.vurgu} />
      </View>
    );
  }

  return (
    <ScrollView
      style={stil.kapsayici}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yukle} />}
    >
      {hata ? <Text style={stil.hata}>{hata}</Text> : null}

      {veri && veri.my_bookings.length > 0 && (
        <View style={stil.kart}>
          <Text style={stil.kartBaslik}>Rezervasyonlarım</Text>
          {veri.my_bookings.map((r) => (
            <View key={r.id} style={stil.rezervasyon}>
              <View>
                <Text style={stil.dersAd}>{r.class_name}</Text>
                <Text style={stil.dersDetay}>
                  {tarihFormat(r.booking_date)} · {r.weekday_name} {r.start_time}
                </Text>
              </View>
              <View style={stil.rozet}>
                <Text style={stil.rozetYazi}>Rezerve</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={stil.kart}>
        <Text style={stil.kartBaslik}>Haftalık Ders Programı</Text>
        {veri && veri.classes.map((d) => (
          <View key={d.id} style={stil.ders}>
            <View style={stil.saatKutusu}>
              <Text style={stil.saat}>{d.start_time}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={stil.dersAd}>{d.name}</Text>
              <Text style={stil.dersDetay}>
                {d.weekday_name}
                {d.trainer_name ? " · " + d.trainer_name : ""}
                {" · " + d.capacity + " kişilik"}
              </Text>
            </View>
          </View>
        ))}
        {veri && veri.classes.length === 0 && (
          <Text style={stil.bos}>Ders programı bulunmuyor.</Text>
        )}
      </View>

      <Text style={stil.not}>
        Derse katılmak için resepsiyondan rezervasyon yaptırabilirsiniz.
      </Text>
    </ScrollView>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan },
  kart: {
    backgroundColor: RENKLER.kart, borderRadius: 12, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: RENKLER.cizgi,
  },
  kartBaslik: { color: RENKLER.vurgu, fontWeight: "bold", fontSize: 15, marginBottom: 14 },
  ders: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#22303d",
  },
  saatKutusu: {
    backgroundColor: "#22303d", borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 12, marginRight: 14,
  },
  saat: { color: RENKLER.vurgu, fontWeight: "bold", fontSize: 15 },
  dersAd: { color: RENKLER.yazi, fontSize: 16, fontWeight: "600" },
  dersDetay: { color: RENKLER.soluk, fontSize: 13, marginTop: 3 },
  rezervasyon: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#22303d",
  },
  rozet: { backgroundColor: "#1f6f43", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rozetYazi: { color: "#d3f9d8", fontSize: 12, fontWeight: "600" },
  bos: { color: RENKLER.soluk, textAlign: "center", paddingVertical: 20 },
  not: { color: RENKLER.soluk, fontSize: 13, textAlign: "center", marginBottom: 20 },
  hata: {
    backgroundColor: "#3b1219", color: "#ffb3ba", padding: 14,
    borderRadius: 8, marginBottom: 16,
  },
});
