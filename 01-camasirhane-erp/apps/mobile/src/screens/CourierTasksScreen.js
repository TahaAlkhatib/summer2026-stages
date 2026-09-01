import { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api, { clearSession, hataMesaji } from "../api";
import { RENKLER, paraFormat } from "../stil";

const SEKMELER = [
  { kod: "bekliyor", etiket: "Bekleyen" },
  { kod: "yolda", etiket: "Yolda" },
  { kod: "tamamlandi", etiket: "Tamamlanan" },
];

export default function CourierTasksScreen({ navigation }) {
  const [sekme, setSekme] = useState("bekliyor");
  const [gorevler, setGorevler] = useState([]);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [hata, setHata] = useState("");

  function yukle() {
    setYenileniyor(true);
    setHata("");
    api.get("/couriers/tasks", { params: { status: sekme } })
      .then((cevap) => setGorevler(cevap.data))
      .catch((err) => setHata(hataMesaji(err)))
      .finally(() => setYenileniyor(false));
  }

  // Ekrana her dönüşte listeyi tazele
  useFocusEffect(useCallback(() => { yukle(); }, [sekme]));

  async function cikisYap() {
    await clearSession();
    navigation.replace("Home");
  }

  function gorevKarti({ item }) {
    const kalan = Number(item.total_amount) - Number(item.paid_amount);
    return (
      <TouchableOpacity
        style={stil.kart}
        onPress={() => navigation.navigate("TaskDetail", { gorev: item })}
      >
        <View style={stil.kartUst}>
          <Text style={stil.siparisNo}>{item.order_no}</Text>
          <View style={stil.rozet}>
            <Text style={stil.rozetYazi}>{item.task_type_label}</Text>
          </View>
        </View>

        <Text style={stil.musteri}>{item.customer_name}</Text>
        <Text style={stil.satir}>{item.customer_phone}</Text>
        <Text style={stil.satir}>{item.address}</Text>

        <View style={stil.kartAlt}>
          <Text style={stil.tutar}>{paraFormat(item.total_amount)}</Text>
          {kalan > 0 ? (
            <Text style={stil.tahsilat}>Tahsilat: {paraFormat(kalan)}</Text>
          ) : (
            <Text style={stil.odendi}>Ödendi</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={stil.kapsayici}>
      <View style={stil.sekmeler}>
        {SEKMELER.map((s) => (
          <TouchableOpacity
            key={s.kod}
            style={[stil.sekme, sekme === s.kod && stil.sekmeAktif]}
            onPress={() => setSekme(s.kod)}
          >
            <Text style={[stil.sekmeYazi, sekme === s.kod && stil.sekmeYaziAktif]}>
              {s.etiket}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {hata ? <Text style={stil.hata}>{hata}</Text> : null}

      <FlatList
        data={gorevler}
        keyExtractor={(g) => String(g.id)}
        renderItem={gorevKarti}
        contentContainerStyle={{ padding: 14 }}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yukle} />}
        ListEmptyComponent={
          !yenileniyor && <Text style={stil.bos}>Görev bulunmuyor.</Text>
        }
      />

      <TouchableOpacity style={stil.cikis} onPress={cikisYap}>
        <Text style={stil.cikisYazi}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan },
  sekmeler: { flexDirection: "row", backgroundColor: "#fff" },
  sekme: { flex: 1, padding: 14, borderBottomWidth: 3, borderBottomColor: "transparent" },
  sekmeAktif: { borderBottomColor: RENKLER.ana },
  sekmeYazi: { textAlign: "center", color: RENKLER.soluk, fontSize: 14 },
  sekmeYaziAktif: { color: RENKLER.ana, fontWeight: "bold" },
  kart: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  kartUst: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  siparisNo: { fontSize: 16, fontWeight: "bold", color: RENKLER.yazi },
  rozet: { backgroundColor: RENKLER.ana, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  rozetYazi: { color: "#fff", fontSize: 12 },
  musteri: { fontSize: 15, marginTop: 8, color: RENKLER.yazi },
  satir: { color: RENKLER.soluk, marginTop: 3, fontSize: 13 },
  kartAlt: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f5",
  },
  tutar: { fontWeight: "bold", color: RENKLER.yazi },
  tahsilat: { color: RENKLER.kirmizi, fontWeight: "600" },
  odendi: { color: RENKLER.yesil, fontWeight: "600" },
  bos: { textAlign: "center", color: RENKLER.soluk, marginTop: 40 },
  hata: { backgroundColor: "#f8d7da", color: "#842029", padding: 12, margin: 14, borderRadius: 6 },
  cikis: { padding: 14, borderTopWidth: 1, borderTopColor: RENKLER.cizgi, backgroundColor: "#fff" },
  cikisYazi: { textAlign: "center", color: RENKLER.kirmizi, fontWeight: "600" },
});
