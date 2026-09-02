import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { oturumuYukle, oturumuKapat } from "./src/api";
import { renkler } from "./src/stil";
import GirisEkrani from "./src/ekranlar/GirisEkrani";
import RotamEkrani from "./src/ekranlar/RotamEkrani";
import TeslimatEkrani from "./src/ekranlar/TeslimatEkrani";

export default function App() {
  const [hazir, setHazir] = useState(false);
  const [kullanici, setKullanici] = useState(null);
  const [seciliGonderi, setSeciliGonderi] = useState(null);
  // Teslimat sonrası rota listesi kendini yenilesin diye sayaç
  const [tazeleme, setTazeleme] = useState(0);

  useEffect(() => {
    oturumuYukle().then((k) => {
      setKullanici(k);
      setHazir(true);
    });
  }, []);

  if (!hazir) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: renkler.zemin }}>
        <ActivityIndicator color={renkler.lacivert} />
      </View>
    );
  }

  if (!kullanici) {
    return (
      <>
        <StatusBar style="light" />
        <GirisEkrani onGiris={setKullanici} />
      </>
    );
  }

  if (seciliGonderi) {
    return (
      <>
        <StatusBar style="light" />
        <TeslimatEkrani
          gonderi={seciliGonderi}
          onGeri={() => setSeciliGonderi(null)}
          onTamamlandi={() => setTazeleme((s) => s + 1)}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <RotamEkrani
        key={tazeleme}
        kullanici={kullanici}
        onGonderiSec={setSeciliGonderi}
        onCikis={async () => {
          await oturumuKapat();
          setKullanici(null);
        }}
      />
    </>
  );
}
