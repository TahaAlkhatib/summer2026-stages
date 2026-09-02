import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from "react-native";
import { oturumuGetir, oturumuKapat, RENKLER } from "./src/api";
import GirisEkrani from "./src/ekranlar/GirisEkrani";
import UyelikEkrani from "./src/ekranlar/UyelikEkrani";
import GirisGecmisi from "./src/ekranlar/GirisGecmisi";
import DerslerEkrani from "./src/ekranlar/DerslerEkrani";

const SEKMELER = [
  { kod: "uyelik", ad: "Üyeliğim" },
  { kod: "gecmis", ad: "Giriş Geçmişi" },
  { kod: "dersler", ad: "Dersler" },
];

export default function App() {
  const [uye, setUye] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [sekme, setSekme] = useState("uyelik");

  useEffect(() => {
    oturumuGetir().then((oturum) => {
      if (oturum) setUye(oturum.uye);
      setYukleniyor(false);
    });
  }, []);

  async function cikisYap() {
    await oturumuKapat();
    setUye(null);
    setSekme("uyelik");
  }

  if (yukleniyor) {
    return (
      <View style={[stil.kapsayici, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={RENKLER.vurgu} />
      </View>
    );
  }

  if (!uye) {
    return <GirisEkrani onGiris={setUye} />;
  }

  return (
    <View style={stil.kapsayici}>
      <StatusBar barStyle="light-content" backgroundColor={RENKLER.kart} />

      <View style={stil.ustSerit}>
        <View>
          <Text style={stil.marka}>SPOR SALONU</Text>
          <Text style={stil.uyeAdi}>{uye.full_name}</Text>
        </View>
        <TouchableOpacity onPress={cikisYap}>
          <Text style={stil.cikis}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <View style={stil.sekmeler}>
        {SEKMELER.map((s) => (
          <TouchableOpacity
            key={s.kod}
            style={[stil.sekme, sekme === s.kod && stil.sekmeAktif]}
            onPress={() => setSekme(s.kod)}
          >
            <Text style={[stil.sekmeYazi, sekme === s.kod && stil.sekmeYaziAktif]}>
              {s.ad}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {sekme === "uyelik" && <UyelikEkrani />}
        {sekme === "gecmis" && <GirisGecmisi />}
        {sekme === "dersler" && <DerslerEkrani />}
      </View>
    </View>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan },
  ustSerit: {
    backgroundColor: RENKLER.kart,
    paddingTop: 48, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
    borderBottomWidth: 1, borderBottomColor: RENKLER.cizgi,
  },
  marka: { color: RENKLER.vurgu, fontWeight: "800", fontSize: 13, letterSpacing: 1 },
  uyeAdi: { color: RENKLER.yazi, fontSize: 19, fontWeight: "bold", marginTop: 4 },
  cikis: { color: RENKLER.soluk, fontSize: 15 },
  sekmeler: { flexDirection: "row", backgroundColor: RENKLER.kart },
  sekme: { flex: 1, paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: "transparent" },
  sekmeAktif: { borderBottomColor: RENKLER.vurgu },
  sekmeYazi: { textAlign: "center", color: RENKLER.soluk, fontSize: 14 },
  sekmeYaziAktif: { color: RENKLER.vurgu, fontWeight: "bold" },
});
