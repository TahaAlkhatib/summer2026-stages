import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import api, { hataMesaji, paraFormat, tarihFormat, RENKLER } from "../api";

// Üyenin turnikede okutacağı QR kodu ve üyelik durumu
export default function UyelikEkrani() {
  const [veri, setVeri] = useState(null);
  const [hata, setHata] = useState("");
  const [yenileniyor, setYenileniyor] = useState(false);

  function yukle() {
    setYenileniyor(true);
    setHata("");
    api.get("/member-portal/me")
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

  if (hata) {
    return (
      <ScrollView
        style={stil.kapsayici}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yukle} />}
      >
        <Text style={stil.hata}>{hata}</Text>
      </ScrollView>
    );
  }

  const uyelik = veri.active_membership;

  return (
    <ScrollView
      style={stil.kapsayici}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yukle} />}
    >
      {/* Turnikede okutulacak QR kodu */}
      <View style={stil.qrKart}>
        <Text style={stil.qrBaslik}>Turnike Giriş Kodu</Text>
        <View style={stil.qrKutu}>
          <QRCode value={veri.member.qr_code} size={190} backgroundColor="#ffffff" />
        </View>
        <Text style={stil.qrKod}>{veri.member.qr_code}</Text>
        <Text style={stil.qrAciklama}>
          Bu kodu turnikedeki okuyucuya gösterin.
        </Text>
      </View>

      {uyelik ? (
        <View style={stil.kart}>
          <Text style={stil.kartBaslik}>Aktif Üyelik</Text>
          <Satir etiket="Paket" deger={uyelik.package_name} />
          <Satir etiket="Başlangıç" deger={tarihFormat(uyelik.start_date)} />
          <Satir etiket="Bitiş" deger={tarihFormat(uyelik.end_date)} />
          <Satir
            etiket="Kalan Gün"
            deger={uyelik.remaining_days + " gün"}
            renk={uyelik.remaining_days <= 7 ? RENKLER.vurgu : RENKLER.yazi}
          />
          <Satir
            etiket="Kalan Seans"
            deger={uyelik.unlimited ? "Sınırsız" : String(uyelik.remaining_sessions)}
            renk={!uyelik.unlimited && uyelik.remaining_sessions <= 2
              ? RENKLER.kirmizi : RENKLER.yazi}
          />

          <View style={stil.ayirac} />

          <Satir etiket="Paket Ücreti" deger={paraFormat(uyelik.total_price)} />
          <Satir etiket="Ödenen" deger={paraFormat(uyelik.paid_amount)} />
          <Satir
            etiket="Kalan Borç"
            deger={paraFormat(uyelik.remaining_debt)}
            renk={uyelik.remaining_debt > 0 ? RENKLER.kirmizi : RENKLER.yesil}
            kalin
          />
        </View>
      ) : (
        <View style={[stil.kart, { alignItems: "center" }]}>
          <Text style={{ color: RENKLER.kirmizi, fontSize: 16, fontWeight: "600" }}>
            Aktif üyeliğiniz bulunmuyor
          </Text>
          <Text style={{ color: RENKLER.soluk, marginTop: 8, textAlign: "center" }}>
            Yeni paket satın almak için resepsiyona başvurun.
          </Text>
        </View>
      )}

      {veri.past_memberships.length > 0 && (
        <View style={stil.kart}>
          <Text style={stil.kartBaslik}>Geçmiş Üyelikler</Text>
          {veri.past_memberships.map((u, i) => (
            <View key={i} style={stil.gecmisSatir}>
              <Text style={{ color: RENKLER.yazi }}>{u.package_name}</Text>
              <Text style={{ color: RENKLER.soluk, fontSize: 13 }}>
                {tarihFormat(u.start_date)} — {tarihFormat(u.end_date)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Satir({ etiket, deger, renk, kalin }) {
  return (
    <View style={stil.satir}>
      <Text style={stil.satirEtiket}>{etiket}</Text>
      <Text style={[
        stil.satirDeger,
        renk ? { color: renk } : null,
        kalin ? { fontWeight: "bold" } : null,
      ]}>
        {deger}
      </Text>
    </View>
  );
}

const stil = StyleSheet.create({
  kapsayici: { flex: 1, backgroundColor: RENKLER.arkaPlan },
  qrKart: {
    backgroundColor: RENKLER.kart, borderRadius: 12, padding: 22,
    alignItems: "center", marginBottom: 16,
    borderWidth: 1, borderColor: RENKLER.vurgu,
  },
  qrBaslik: { color: RENKLER.vurgu, fontWeight: "bold", fontSize: 15, marginBottom: 16 },
  qrKutu: { backgroundColor: "#fff", padding: 14, borderRadius: 10 },
  qrKod: {
    color: RENKLER.yazi, marginTop: 14, fontSize: 17,
    fontFamily: "monospace", letterSpacing: 1,
  },
  qrAciklama: { color: RENKLER.soluk, marginTop: 8, fontSize: 13 },
  kart: {
    backgroundColor: RENKLER.kart, borderRadius: 12, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: RENKLER.cizgi,
  },
  kartBaslik: { color: RENKLER.vurgu, fontWeight: "bold", fontSize: 15, marginBottom: 14 },
  satir: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 7,
  },
  satirEtiket: { color: RENKLER.soluk, fontSize: 14 },
  satirDeger: { color: RENKLER.yazi, fontSize: 14, fontWeight: "600" },
  ayirac: { height: 1, backgroundColor: RENKLER.cizgi, marginVertical: 12 },
  gecmisSatir: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#22303d" },
  hata: {
    backgroundColor: "#3b1219", color: "#ffb3ba", padding: 14,
    borderRadius: 8, margin: 16,
  },
});
