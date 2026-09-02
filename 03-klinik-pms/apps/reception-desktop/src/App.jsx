import { useEffect, useState } from "react";
import api, { getUser, hataMesaji } from "./api";
import Giris from "./Giris";
import BugunkuRandevular from "./BugunkuRandevular";
import HizliRandevu from "./HizliRandevu";
import Tahsilat from "./Tahsilat";

// Resepsiyon uygulaması tek pencerede sekmelerle çalışır
const SEKMELER = [
  { kod: "randevular", ad: "Bugünkü Randevular" },
  { kod: "hizli", ad: "Hızlı Randevu" },
  { kod: "tahsilat", ad: "Tahsilat" },
];

function App() {
  const [kullanici, setKullanici] = useState(getUser());
  const [sekme, setSekme] = useState("randevular");
  const [saat, setSaat] = useState(new Date());

  // Üst şeritte canlı saat
  useEffect(() => {
    const zamanlayici = setInterval(() => setSaat(new Date()), 1000);
    return () => clearInterval(zamanlayici);
  }, []);

  function cikisYap() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setKullanici(null);
  }

  if (!kullanici) {
    return <Giris onGiris={setKullanici} />;
  }

  return (
    <div>
      <div className="ust-serit">
        <div className="marka">KLİNİK RESEPSİYON</div>
        <div className="saat-kutusu" style={{ color: "#fff" }}>
          {saat.toLocaleTimeString("tr-TR")}
        </div>
        <div>
          <span style={{ marginRight: 14 }}>{kullanici.full_name}</span>
          <button className="kucuk" onClick={cikisYap}>Çıkış</button>
        </div>
      </div>

      <div className="sekmeler">
        {SEKMELER.map((s) => (
          <div
            key={s.kod}
            className={"sekme" + (sekme === s.kod ? " aktif" : "")}
            onClick={() => setSekme(s.kod)}
          >
            {s.ad}
          </div>
        ))}
      </div>

      <div className="icerik">
        {sekme === "randevular" && <BugunkuRandevular />}
        {sekme === "hizli" && <HizliRandevu />}
        {sekme === "tahsilat" && <Tahsilat />}
      </div>
    </div>
  );
}

export default App;
