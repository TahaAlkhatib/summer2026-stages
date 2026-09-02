import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from "react-native";
import { api } from "../api";
import {
  renkler, GOREV_DURUMLARI, gorevTuru, oncelikEtiketi, tarihSaat,
} from "../stil";

export default function GorevDetayEkrani({ gorev, onGeri, onGuncellendi }) {
  const [durum, setDurum] = useState(gorev.status);
  const [not, setNot] = useState("");
  const [islemde, setIslemde] = useState(false);
  const [hata, setHata] = useState("");

  const durumBilgisi = GOREV_DURUMLARI[durum] || GOREV_DURUMLARI.bekliyor;

  async function baslat() {
    setHata("");
    setIslemde(true);
    try {
      await api.put(`/tasks/${gorev.id}/start`);
      setDurum("basladi");
      onGuncellendi();
    } catch (e) {
      setHata(e.message);
    }
    setIslemde(false);
  }

  async function tamamla() {
    setHata("");
    setIslemde(true);
    try {
      const cevap = await api.put(`/tasks/${gorev.id}/complete`, { note: not });
      setDurum("tamamlandi");
      onGuncellendi();
      Alert.alert("Görev tamamlandı", cevap.message, [
        { text: "Tamam", onPress: onGeri },
      ]);
    } catch (e) {
      setHata(e.message);
    }
    setIslemde(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: renkler.zemin }}>
      <View style={s.ustBar}>
        <TouchableOpacity onPress={onGeri} style={s.geriDugmesi}>
          <Text style={s.geriYazi}>‹ Geri</Text>
        </TouchableOpacity>
        <Text style={s.baslik}>{gorev.roomNumber}</Text>
        <Text style={s.altBaslik}>{gorev.propertyName} · {gorev.roomType}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {hata ? <Text style={s.hata}>{hata}</Text> : null}

        <View style={s.kart}>
          <View style={s.satir}>
            <Text style={s.etiket}>Durum</Text>
            <View style={[s.rozet, { backgroundColor: durumBilgisi.zemin }]}>
              <Text style={[s.rozetYazi, { color: durumBilgisi.renk }]}>
                {durumBilgisi.etiket}
              </Text>
            </View>
          </View>
          <Bilgi etiket="Görev türü" deger={gorevTuru(gorev.type)} />
          <Bilgi etiket="Öncelik" deger={oncelikEtiketi(gorev.priority)}
            renk={gorev.priority === "acil" ? renkler.kirmizi : undefined} />
          <Bilgi etiket="Açılış" deger={tarihSaat(gorev.createdAt)} />
          <Bilgi
            etiket="Nasıl açıldı"
            deger={gorev.source === "cikis" ? "Misafir çıkışında otomatik" : "Elle açıldı"}
          />
          {gorev.assignedName && <Bilgi etiket="Görevli" deger={gorev.assignedName} />}
          {gorev.startedAt && <Bilgi etiket="Başlangıç" deger={tarihSaat(gorev.startedAt)} />}
          {gorev.completedAt && <Bilgi etiket="Bitiş" deger={tarihSaat(gorev.completedAt)} />}
        </View>

        <View style={s.kart}>
          <Text style={s.kartBaslik}>Açıklama</Text>
          <Text style={s.aciklama}>{gorev.description || "-"}</Text>
        </View>

        {durum === "tamamlandi" ? (
          <View style={s.kart}>
            <Text style={s.kartBaslik}>Tamamlama Notu</Text>
            <Text style={s.aciklama}>
              {not || gorev.completionNote || "Not girilmedi."}
            </Text>
          </View>
        ) : (
          <View style={s.kart}>
            <Text style={s.kartBaslik}>Tamamlama Notu (isteğe bağlı)</Text>
            <TextInput
              style={s.girdi}
              value={not}
              onChangeText={setNot}
              placeholder="Örn: Havlular yenilendi, klima kontrol edildi."
              multiline
            />
          </View>
        )}

        {durum === "bekliyor" && (
          <TouchableOpacity
            style={[s.dugme, { backgroundColor: renkler.ana }, islemde && { opacity: 0.6 }]}
            onPress={baslat}
            disabled={islemde}
          >
            <Text style={s.dugmeYazi}>İşe Başla</Text>
          </TouchableOpacity>
        )}

        {durum === "basladi" && (
          <TouchableOpacity
            style={[s.dugme, { backgroundColor: renkler.yesil }, islemde && { opacity: 0.6 }]}
            onPress={tamamla}
            disabled={islemde}
          >
            <Text style={s.dugmeYazi}>Görevi Tamamla</Text>
          </TouchableOpacity>
        )}

        {durum === "tamamlandi" && (
          <Text style={s.bilgiYazi}>
            Bu görev tamamlandı. Odada başka bekleyen iş yoksa oda satışa açıldı.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function Bilgi({ etiket, deger, renk }) {
  return (
    <View style={s.satir}>
      <Text style={s.etiket}>{etiket}</Text>
      <Text style={[s.deger, renk && { color: renk }]}>{deger}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  ustBar: { backgroundColor: renkler.ana, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  geriDugmesi: { marginBottom: 8 },
  geriYazi: { color: "#b7c7d1", fontSize: 15 },
  baslik: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  altBaslik: { color: "#b7c7d1", fontSize: 13, marginTop: 2 },

  kart: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: renkler.cizgi,
  },
  kartBaslik: { fontWeight: "bold", color: renkler.ana, marginBottom: 8 },
  satir: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 6,
  },
  etiket: { color: renkler.soluk, fontSize: 13 },
  deger: { fontSize: 14, fontWeight: "500", color: renkler.metin, flexShrink: 1, textAlign: "right" },
  rozet: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  rozetYazi: { fontSize: 12, fontWeight: "600" },
  aciklama: { fontSize: 14, color: renkler.metin, lineHeight: 20 },
  girdi: {
    borderWidth: 1, borderColor: renkler.cizgi, borderRadius: 10,
    padding: 12, minHeight: 80, textAlignVertical: "top", fontSize: 14,
  },
  dugme: { borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  dugmeYazi: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  hata: {
    backgroundColor: "#fee2e2", color: "#991b1b",
    padding: 12, borderRadius: 10, marginBottom: 12, fontSize: 13,
  },
  bilgiYazi: { textAlign: "center", color: renkler.soluk, fontSize: 13, marginTop: 8 },
});
