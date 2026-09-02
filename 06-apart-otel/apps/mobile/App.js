import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { oturumuYukle, oturumuKapat } from "./src/api";
import { renkler } from "./src/stil";
import GirisEkrani from "./src/ekranlar/GirisEkrani";
import GorevlerEkrani from "./src/ekranlar/GorevlerEkrani";
import GorevDetayEkrani from "./src/ekranlar/GorevDetayEkrani";

export default function App() {
  const [hazir, setHazir] = useState(false);
  const [kullanici, setKullanici] = useState(null);
  const [seciliGorev, setSeciliGorev] = useState(null);
  // Detay ekraninda islem yapilinca liste kendini yenilesin diye sayac
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
        <ActivityIndicator color={renkler.ana} />
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

  if (seciliGorev) {
    return (
      <>
        <StatusBar style="light" />
        <GorevDetayEkrani
          gorev={seciliGorev}
          onGeri={() => setSeciliGorev(null)}
          onGuncellendi={() => setTazeleme((s) => s + 1)}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <GorevlerEkrani
        key={tazeleme}
        kullanici={kullanici}
        onGorevSec={setSeciliGorev}
        onCikis={async () => {
          await oturumuKapat();
          setKullanici(null);
        }}
      />
    </>
  );
}
