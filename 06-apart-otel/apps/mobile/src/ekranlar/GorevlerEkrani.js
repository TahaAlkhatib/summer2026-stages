import { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator,
} from "react-native";
import { api } from "../api";
import { renkler, GOREV_DURUMLARI, gorevTuru, gecenSure } from "../stil";

const FILTRELER = [
  { deger: "", etiket: "Hepsi" },
  { deger: "bekliyor", etiket: "Bekleyen" },
  { deger: "basladi", etiket: "Devam eden" },
  { deger: "tamamlandi", etiket: "Biten" },
];

export default function GorevlerEkrani({ kullanici, onGorevSec, onCikis }) {
  const [gorevler, setGorevler] = useState([]);
  const [filtre, setFiltre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [tazeleniyor, setTazeleniyor] = useState(false);
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    try {
      let yol = "/tasks?mine=1";
      if (filtre) yol += "&status=" + filtre;
      setGorevler(await api.get(yol));
      setHata("");
    } catch (e) {
      setHata(e.message);
    }
    setYukleniyor(false);
    setTazeleniyor(false);
  }, [filtre]);

  useEffect(() => {
    setYukleniyor(true);
    yukle();
  }, [yukle]);

  const bekleyenSayisi = gorevler.filter((g) => g.status === "bekliyor").length;

  return (
    <View style={{ flex: 1, backgroundColor: renkler.zemin }}>
      <View style={s.ustBar}>
        <View style={{ flex: 1 }}>
          <Text style={s.baslik}>Görevlerim</Text>
          <Text style={s.altBaslik}>
            {kullanici.fullName} · {kullanici.role === "teknik" ? "Teknik Ekip" : "Temizlik Ekibi"}
          </Text>
        </View>
        <TouchableOpacity onPress={onCikis} style={s.cikisDugmesi}>
          <Text style={s.cikisYazi}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {filtre === "" && bekleyenSayisi > 0 && (
        <View style={s.uyariSerit}>
          <Text style={s.uyariYazi}>
            {bekleyenSayisi} görev sizi bekliyor
          </Text>
        </View>
      )}

      <View style={s.filtreSatiri}>
        {FILTRELER.map((f) => (
          <TouchableOpacity
            key={f.deger}
            onPress={() => setFiltre(f.deger)}
            style={[s.filtreDugmesi, filtre === f.deger && s.filtreSecili]}
          >
            <Text style={[s.filtreYazi, filtre === f.deger && s.filtreYaziSecili]}>
              {f.etiket}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {hata ? <Text style={s.hata}>{hata}</Text> : null}

      {yukleniyor ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={renkler.ana} />
      ) : (
        <FlatList
          data={gorevler}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={tazeleniyor}
              onRefresh={() => { setTazeleniyor(true); yukle(); }}
            />
          }
          ListEmptyComponent={
            <Text style={s.bos}>Bu filtrede görev yok.</Text>
          }
          renderItem={({ item }) => {
            const durum = GOREV_DURUMLARI[item.status] || GOREV_DURUMLARI.bekliyor;
            const acil = item.priority === "acil";

            return (
              <TouchableOpacity
                style={[s.kart, acil && s.kartAcil]}
                onPress={() => onGorevSec(item)}
              >
                <View style={s.kartUst}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.odaNo}>{item.roomNumber}</Text>
                    <Text style={s.tesis}>{item.propertyName} · {item.roomType}</Text>
                  </View>
                  <View style={[s.rozet, { backgroundColor: durum.zemin }]}>
                    <Text style={[s.rozetYazi, { color: durum.renk }]}>{durum.etiket}</Text>
                  </View>
                </View>

                <Text style={s.aciklama} numberOfLines={2}>{item.description}</Text>

                <View style={s.kartAlt}>
                  <Text style={s.tur}>{gorevTuru(item.type)}</Text>
                  {item.source === "cikis" && (
                    <Text style={s.otomatik}>çıkış sonrası otomatik</Text>
                  )}
                  <View style={{ flex: 1 }} />
                  <Text style={s.zaman}>{gecenSure(item.createdAt)}</Text>
                </View>

                {acil && <Text style={s.acil}>ACİL</Text>}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  ustBar: {
    backgroundColor: renkler.ana, paddingTop: 50, paddingBottom: 16,
    paddingHorizontal: 16, flexDirection: "row", alignItems: "flex-end",
  },
  baslik: { color: "#fff", fontSize: 21, fontWeight: "bold" },
  altBaslik: { color: "#b7c7d1", fontSize: 12, marginTop: 2 },
  cikisDugmesi: {
    backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 8,
  },
  cikisYazi: { color: "#fff", fontSize: 13 },

  uyariSerit: { backgroundColor: "#fef3c7", paddingVertical: 9, paddingHorizontal: 16 },
  uyariYazi: { color: "#92400e", fontSize: 13, fontWeight: "600" },

  filtreSatiri: { flexDirection: "row", padding: 12, gap: 8 },
  filtreDugmesi: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: renkler.cizgi, backgroundColor: "#fff",
  },
  filtreSecili: { backgroundColor: renkler.ana, borderColor: renkler.ana },
  filtreYazi: { fontSize: 13, color: renkler.metin },
  filtreYaziSecili: { color: "#fff", fontWeight: "600" },

  hata: {
    backgroundColor: "#fee2e2", color: "#991b1b",
    marginHorizontal: 12, padding: 12, borderRadius: 10, fontSize: 13,
  },
  bos: { textAlign: "center", color: renkler.soluk, marginTop: 40 },

  kart: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: renkler.cizgi,
  },
  kartAcil: { borderColor: "#fca5a5", backgroundColor: "#fff7f7" },
  kartUst: { flexDirection: "row", alignItems: "flex-start" },
  odaNo: { fontSize: 18, fontWeight: "bold", color: renkler.ana },
  tesis: { fontSize: 12, color: renkler.soluk, marginTop: 1 },
  rozet: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  rozetYazi: { fontSize: 11, fontWeight: "600" },
  aciklama: { fontSize: 13, color: renkler.metin, marginTop: 8 },
  kartAlt: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 },
  tur: {
    fontSize: 11, color: renkler.anaAcik, backgroundColor: "#e0f2fe",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, overflow: "hidden",
  },
  otomatik: { fontSize: 11, color: renkler.soluk },
  zaman: { fontSize: 11, color: renkler.soluk },
  acil: { color: renkler.kirmizi, fontWeight: "bold", fontSize: 11, marginTop: 8 },
});
