import { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from "react-native";
import Svg, { Path } from "react-native-svg";
import { renkler } from "./stil";

// Parmakla imza alma alanı.
// Dokunma noktalarını toplayıp SVG yoluna çeviriyoruz; kaydederken
// oluşan SVG metni sunucuya gönderiliyor.
export default function ImzaAlani({ onDegisti }) {
  const [yollar, setYollar] = useState([]);
  const [aktifYol, setAktifYol] = useState("");
  const aktifRef = useRef("");
  // Tamamlanan çizgileri ref'te de tutuyoruz; PanResponder kapanışları
  // eski state'i görmesin diye.
  const yollarRef = useRef([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (olay) => {
        const { locationX, locationY } = olay.nativeEvent;
        aktifRef.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setAktifYol(aktifRef.current);
      },

      onPanResponderMove: (olay) => {
        const { locationX, locationY } = olay.nativeEvent;
        aktifRef.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setAktifYol(aktifRef.current);
      },

      onPanResponderRelease: () => {
        const biten = aktifRef.current;
        aktifRef.current = "";
        setAktifYol("");
        if (!biten) return;

        yollarRef.current = [...yollarRef.current, biten];
        setYollar(yollarRef.current);
        onDegisti(svgUret(yollarRef.current));
      },
    })
  ).current;

  function temizle() {
    yollarRef.current = [];
    setYollar([]);
    setAktifYol("");
    aktifRef.current = "";
    onDegisti("");
  }

  return (
    <View>
      <View style={s.alan} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {yollar.map((y, i) => (
            <Path key={i} d={y} stroke="#111" strokeWidth="2.5" fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {aktifYol ? (
            <Path d={aktifYol} stroke="#111" strokeWidth="2.5" fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>

        {yollar.length === 0 && !aktifYol && (
          <Text style={s.ipucu}>Alıcı buraya imza atsın</Text>
        )}
      </View>

      <TouchableOpacity style={s.temizle} onPress={temizle}>
        <Text style={s.temizleYazi}>İmzayı Temizle</Text>
      </TouchableOpacity>
    </View>
  );
}

// Toplanan yolları tek bir SVG metnine çevirir
function svgUret(yollar) {
  if (yollar.length === 0) return "";
  const cizgiler = yollar
    .map((y) => `<path d="${y}" stroke="#111" stroke-width="2.5" fill="none"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="150">${cizgiler}</svg>`;
}

const s = StyleSheet.create({
  alan: {
    height: 150,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: renkler.cizgi,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  ipucu: { color: "#c0c6cc", fontSize: 14 },
  temizle: { alignSelf: "flex-end", marginTop: 6, paddingVertical: 4, paddingHorizontal: 8 },
  temizleYazi: { color: renkler.soluk, fontSize: 13 },
});
