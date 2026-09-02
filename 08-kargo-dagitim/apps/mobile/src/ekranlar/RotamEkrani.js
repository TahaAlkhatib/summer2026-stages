import { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from "react-native";
import { api } from "../api";
import { renkler, para, tarihSaat } from "../stil";

// Kuryenin üzerindeki gönderiler
export default function RotamEkrani({ kullanici, onGonderiSec, onCikis }) {
  const [veri, setVeri] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [tazeleniyor, setTazeleniyor] = useState(false);
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    try {
      setVeri(await api.get("/delivery/my-route"));
      setHata("");
    } catch (e) {
      setHata(e.message);
    }
    setYukleniyor(false);
    setTazeleniyor(false);
  }, []);

  useEffect(() => { yukle(); }, [yukle]);

  return (
    <View style={{ flex: 1, backgroundColor: renkler.zemin }}>
      <View style={s.ustBar}>
        <View style={{ flex: 1 }}>
          <Text style={s.baslik}>Rotam</Text>
          <Text style={s.altBaslik}>
            {kullanici.fullName} · {kullanici.plate}
          </Text>
        </View>
        <TouchableOpacity onPress={onCikis} style={s.cikisDugmesi}>
          <Text style={s.cikisYazi}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {veri && (
        <View style={s.ozetSerit}>
          <View style={s.ozetKutu}>
            <Text style={s.ozetDeger}>{veri.pending.length}</Text>
            <Text style={s.ozetEtiket}>Bekleyen</Text>
          </View>
          <View style={s.ozetKutu}>
            <Text style={[s.ozetDeger, { color: renkler.yesil }]}>
              {veri.delivered_today.length}
            </Text>
            <Text style={s.ozetEtiket}>Bugün teslim</Text>
          </View>
          <View style={[s.ozetKutu, { flex: 1.5 }]}>
            <Text style={[s.ozetDeger, { color: renkler.turuncu, fontSize: 16 }]}>
              {para(veri.pending_cod_total)}
            </Text>
            <Text style={s.ozetEtiket}>Tahsil edilecek</Text>
          </View>
        </View>
      )}

      {hata ? <Text style={s.hata}>{hata}</Text> : null}

      {yukleniyor ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={renkler.lacivert} />
      ) : (
        <FlatList
          data={veri ? veri.pending : []}
          keyExtractor={(g) => String(g.id)}
          contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={tazeleniyor}
              onRefresh={() => { setTazeleniyor(true); yukle(); }} />
          }
          ListEmptyComponent={
            <Text style={s.bos}>Üzerinizde bekleyen gönderi yok.</Text>
          }
          ListFooterComponent={
            veri && veri.delivered_today.length > 0 ? (
              <View style={s.bugunKutu}>
                <Text style={s.bugunBaslik}>
                  Bugün teslim ettikleriniz ({veri.delivered_today.length})
                </Text>
                {veri.delivered_today.map((g) => (
                  <View key={g.barcode} style={s.bugunSatir}>
                    <Text style={s.bugunBarkod}>{g.barcode}</Text>
                    <Text style={s.bugunAd}>{g.receiver_name}</Text>
                    <Text style={s.bugunSaat}>{tarihSaat(g.delivered_at).slice(11)}</Text>
                  </View>
                ))}
                <Text style={s.bugunToplam}>
                  Tahsil edilen: {para(veri.collected_today)}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.kart} onPress={() => onGonderiSec(item)}>
              <View style={s.kartUst}>
                <Text style={s.barkod}>{item.barcode}</Text>
                {Number(item.cod_amount) > 0 && (
                  <View style={s.kapidaRozet}>
                    <Text style={s.kapidaYazi}>{para(item.cod_amount)}</Text>
                  </View>
                )}
              </View>

              <Text style={s.aliciAd}>{item.receiver_name}</Text>
              <Text style={s.telefon}>{item.receiver_phone}</Text>
              <Text style={s.adres}>{item.receiver_address}</Text>

              <View style={s.kartAlt}>
                <Text style={s.ilce}>{item.receiver_district}</Text>
                <Text style={s.gonderici}>{item.company_name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  ustBar: {
    backgroundColor: renkler.lacivert, paddingTop: 50, paddingBottom: 16,
    paddingHorizontal: 16, flexDirection: "row", alignItems: "flex-end",
  },
  baslik: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  altBaslik: { color: "#a8c0d4", fontSize: 12, marginTop: 2 },
  cikisDugmesi: { backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  cikisYazi: { color: "#fff", fontSize: 13 },

  ozetSerit: { flexDirection: "row", backgroundColor: "#fff", paddingVertical: 12 },
  ozetKutu: { flex: 1, alignItems: "center" },
  ozetDeger: { fontSize: 20, fontWeight: "bold", color: renkler.lacivert },
  ozetEtiket: { fontSize: 11, color: renkler.soluk, marginTop: 2 },

  hata: { backgroundColor: "#fee2e2", color: "#991b1b", margin: 12,
    padding: 12, borderRadius: 10, fontSize: 13 },
  bos: { textAlign: "center", color: renkler.soluk, marginTop: 40 },

  kart: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: renkler.cizgi },
  kartUst: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  barkod: { flex: 1, fontFamily: "monospace", fontSize: 14,
    fontWeight: "bold", color: renkler.lacivert },
  kapidaRozet: { backgroundColor: "#ffedd5", paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20 },
  kapidaYazi: { color: "#c2410c", fontSize: 12, fontWeight: "700" },

  aliciAd: { fontSize: 16, fontWeight: "600" },
  telefon: { fontSize: 13, color: renkler.soluk, marginTop: 1 },
  adres: { fontSize: 13, color: renkler.metin, marginTop: 6 },
  kartAlt: { flexDirection: "row", marginTop: 8, alignItems: "center" },
  ilce: { fontSize: 12, color: renkler.lacivertAcik, backgroundColor: "#dbeafe",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, overflow: "hidden" },
  gonderici: { fontSize: 12, color: renkler.soluk, marginLeft: 8, flex: 1 },

  bugunKutu: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginTop: 6,
    borderWidth: 1, borderColor: renkler.cizgi },
  bugunBaslik: { fontWeight: "bold", color: renkler.lacivert, marginBottom: 8 },
  bugunSatir: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  bugunBarkod: { fontFamily: "monospace", fontSize: 12, color: renkler.soluk, width: 110 },
  bugunAd: { flex: 1, fontSize: 13 },
  bugunSaat: { fontSize: 12, color: renkler.soluk },
  bugunToplam: { marginTop: 8, fontWeight: "600", color: renkler.yesil },
});
