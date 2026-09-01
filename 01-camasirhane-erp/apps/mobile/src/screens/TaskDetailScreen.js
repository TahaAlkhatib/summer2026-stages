import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking,
} from "react-native";
import api, { hataMesaji } from "../api";
import { RENKLER, paraFormat, tarihSaatFormat, GOREV_DURUM_ETIKETLERI } from "../stil";

export default function TaskDetailScreen({ route, navigation }) {
  const gorev = route.params.gorev;
  const kalan = Number(gorev.total_amount) - Number(gorev.paid_amount);

  const [tahsilatFormu, setTahsilatFormu] = useState(false);
  const [tutar, setTutar] = useState(kalan > 0 ? String(kalan) : "");
  const [yontem, setYontem] = useState("nakit");
  const [basarisizFormu, setBasarisizFormu] = useState(false);
  const [not, setNot] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function durumGuncelle(yeniDurum, aciklama) {
    setBekliyor(true);
    try {
      await api.put("/couriers/tasks/" + gorev.id + "/status", {
        status: yeniDurum,
        note: aciklama,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert("Hata", hataMesaji(err));
    }
    setBekliyor(false);
  }

  async function teslimEt() {
    // Kalan borç varsa önce tahsilat kutusunu aç
    if (kalan > 0 && !tahsilatFormu) {
      setTahsilatFormu(true);
      return;
    }

    setBekliyor(true);
    try {
      if (kalan > 0) {
        await api.post("/payments", {
          order_id: gorev.order_id,
          amount: Number(tutar),
          method: yontem,
        });
      }
      await api.put("/couriers/tasks/" + gorev.id + "/status", { status: "tamamlandi" });
      navigation.goBack();
    } catch (err) {
      Alert.alert("Hata", hataMesaji(err));
    }
    setBekliyor(false);
  }

  return (
    <ScrollView style={stil.kapsayici}>
      <View style={stil.kart}>
        <Text style={stil.kartBaslik}>Sipariş</Text>
        <Satir etiket="Sipariş No" deger={gorev.order_no} />
        <Satir etiket="Görev Tipi" deger={gorev.task_type_label} />
        <Satir etiket="Durum" deger={GOREV_DURUM_ETIKETLERI[gorev.status]} />
        <Satir etiket="Planlanan" deger={tarihSaatFormat(gorev.scheduled_at)} />
      </View>

      <View style={stil.kart}>
        <Text style={stil.kartBaslik}>Müşteri</Text>
        <Satir etiket="Ad Soyad" deger={gorev.customer_name} />
        <TouchableOpacity onPress={() => Linking.openURL("tel:" + gorev.customer_phone)}>
          <Satir etiket="Telefon" deger={gorev.customer_phone} link />
        </TouchableOpacity>
        <Satir etiket="Adres" deger={gorev.address} />
      </View>

      <View style={stil.kart}>
        <Text style={stil.kartBaslik}>Tutar</Text>
        <Satir etiket="Toplam" deger={paraFormat(gorev.total_amount)} />
        <Satir etiket="Ödenen" deger={paraFormat(gorev.paid_amount)} />
        <Satir etiket="Kalan" deger={paraFormat(kalan)} />
      </View>

      {gorev.status === "tamamlandi" && (
        <View style={stil.tamamlandi}>
          <Text style={stil.tamamlandiYazi}>Bu görev tamamlandı.</Text>
        </View>
      )}

      {gorev.status === "bekliyor" && (
        <TouchableOpacity
          style={stil.buton}
          onPress={() => durumGuncelle("yolda")}
          disabled={bekliyor}
        >
          <Text style={stil.butonYazi}>Yola Çıktım</Text>
        </TouchableOpacity>
      )}

      {gorev.status === "yolda" && (
        <View>
          {tahsilatFormu && (
            <View style={stil.kart}>
              <Text style={stil.kartBaslik}>Tahsilat</Text>
              <Text style={stil.etiket}>Tutar (₺)</Text>
              <TextInput
                style={stil.giris}
                value={tutar}
                onChangeText={setTutar}
                keyboardType="numeric"
              />
              <Text style={stil.etiket}>Yöntem</Text>
              <View style={{ flexDirection: "row" }}>
                {["nakit", "kart"].map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[stil.yontem, yontem === y && stil.yontemAktif]}
                    onPress={() => setYontem(y)}
                  >
                    <Text style={yontem === y ? stil.yontemYaziAktif : stil.yontemYazi}>
                      {y === "nakit" ? "Nakit" : "Kart"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={stil.buton} onPress={teslimEt} disabled={bekliyor}>
            <Text style={stil.butonYazi}>
              {kalan > 0 && !tahsilatFormu ? "Teslim Ettim (Tahsilat Var)" : "Teslim Ettim"}
            </Text>
          </TouchableOpacity>

          {basarisizFormu ? (
            <View style={stil.kart}>
              <Text style={stil.kartBaslik}>Teslim Edilemedi</Text>
              <Text style={stil.etiket}>Sebep (zorunlu)</Text>
              <TextInput
                style={stil.giris}
                value={not}
                onChangeText={setNot}
                multiline
                placeholder="Örn: Adreste kimse yoktu"
              />
              <TouchableOpacity
                style={[stil.buton, stil.kirmiziButon]}
                onPress={() => {
                  if (!not.trim()) {
                    Alert.alert("Uyarı", "Lütfen bir sebep yazın.");
                    return;
                  }
                  durumGuncelle("basarisiz", not);
                }}
                disabled={bekliyor}
              >
                <Text style={stil.butonYazi}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[stil.buton, stil.kirmiziButon]}
              onPress={() => setBasarisizFormu(true)}
            >
              <Text style={stil.butonYazi}>Teslim Edilemedi</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function Satir({ etiket, deger, link }) {
  return (
    <View style={stil.satir}>
      <Text style={stil.satirEtiket}>{etiket}</Text>
      <Text style={[stil.satirDeger, link && { color: RENKLER.ana }]}>{deger || "-"}</Text>
    </View>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan, padding: 14 },
  kart: { backgroundColor: "#fff", borderRadius: 8, padding: 14, marginBottom: 12, elevation: 2 },
  kartBaslik: { fontSize: 15, fontWeight: "bold", color: RENKLER.ana, marginBottom: 10 },
  satir: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  satirEtiket: { color: RENKLER.soluk, fontSize: 14 },
  satirDeger: { fontWeight: "600", fontSize: 14, flexShrink: 1, textAlign: "right", marginLeft: 12 },
  buton: { backgroundColor: RENKLER.ana, padding: 16, borderRadius: 8, marginBottom: 12 },
  kirmiziButon: { backgroundColor: RENKLER.kirmizi },
  butonYazi: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "600" },
  etiket: { fontWeight: "600", marginBottom: 6 },
  giris: {
    borderWidth: 1, borderColor: RENKLER.cizgi, borderRadius: 6,
    padding: 10, marginBottom: 12, fontSize: 15,
  },
  yontem: {
    borderWidth: 1, borderColor: RENKLER.cizgi, borderRadius: 6,
    paddingVertical: 8, paddingHorizontal: 20, marginRight: 10,
  },
  yontemAktif: { backgroundColor: RENKLER.ana, borderColor: RENKLER.ana },
  yontemYazi: { color: RENKLER.yazi },
  yontemYaziAktif: { color: "#fff", fontWeight: "600" },
  tamamlandi: { backgroundColor: "#d1e7dd", padding: 14, borderRadius: 8, marginBottom: 12 },
  tamamlandiYazi: { color: "#0f5132", textAlign: "center", fontWeight: "600" },
});
