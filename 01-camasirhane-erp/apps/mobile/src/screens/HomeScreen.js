import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { getSession } from "../api";
import { RENKLER } from "../stil";

export default function HomeScreen({ navigation }) {
  const [kontrolEdiliyor, setKontrolEdiliyor] = useState(true);

  useEffect(() => {
    // Daha önce giriş yapılmışsa doğrudan görev listesine git
    getSession().then((oturum) => {
      if (oturum) {
        navigation.replace("CourierTasks");
      } else {
        setKontrolEdiliyor(false);
      }
    });
  }, []);

  if (kontrolEdiliyor) {
    return (
      <View style={[stil.kapsayici, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={RENKLER.ana} />
      </View>
    );
  }

  return (
    <View style={stil.kapsayici}>
      <Text style={stil.baslik}>Çamaşırhane</Text>
      <Text style={stil.altBaslik}>Sipariş takibi ve kurye uygulaması</Text>

      <TouchableOpacity style={stil.anaButon} onPress={() => navigation.navigate("TrackOrder")}>
        <Text style={stil.anaButonYazi}>Sipariş Takibi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={stil.ikincilButon} onPress={() => navigation.navigate("Login")}>
        <Text style={stil.ikincilButonYazi}>Kurye Girişi</Text>
      </TouchableOpacity>
    </View>
  );
}

const stil = StyleSheet.create({
  kapsayici: {
    flex: 1,
    backgroundColor: RENKLER.arkaPlan,
    padding: 30,
    justifyContent: "center",
  },
  baslik: {
    fontSize: 34,
    fontWeight: "bold",
    color: RENKLER.ana,
    textAlign: "center",
  },
  altBaslik: {
    fontSize: 15,
    color: RENKLER.soluk,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 50,
  },
  anaButon: {
    backgroundColor: RENKLER.ana,
    padding: 18,
    borderRadius: 8,
    marginBottom: 16,
  },
  anaButonYazi: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  ikincilButon: {
    borderWidth: 1,
    borderColor: RENKLER.ana,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  ikincilButonYazi: {
    color: RENKLER.ana,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
});
