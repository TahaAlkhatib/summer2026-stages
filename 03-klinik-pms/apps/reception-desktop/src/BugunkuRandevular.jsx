import { useEffect, useState } from "react";
import api, { hataMesaji, saatFormat, yerelTarih, RANDEVU_DURUMLARI } from "./api";

// Resepsiyonun ana ekranı: bugünkü randevular ve check-in
function BugunkuRandevular() {
  const [liste, setListe] = useState([]);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  function yukle() {
    api.get("/appointments", { params: { date: yerelTarih() } })
      .then((c) => setListe(c.data))
      .catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => {
    yukle();
    // Resepsiyon ekranı açık kaldığı için 30 saniyede bir tazelenir
    const zamanlayici = setInterval(yukle, 30000);
    return () => clearInterval(zamanlayici);
  }, []);

  async function durumGuncelle(id, durum) {
    setHata("");
    setBasarili("");
    try {
      await api.put("/appointments/" + id + "/status", { status: durum });
      setBasarili("Randevu durumu güncellendi: " + RANDEVU_DURUMLARI[durum]);
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  const bekleyen = liste.filter((r) => r.status === "planlandi").length;
  const gelen = liste.filter((r) => r.status === "geldi").length;

  return (
    <div>
      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="satir" style={{ marginBottom: 18 }}>
        <div className="kart" style={{ marginBottom: 0 }}>
          <div style={{ color: "#6b7f7f", fontSize: 13 }}>Bugünkü Randevu</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f766e" }}>{liste.length}</div>
        </div>
        <div className="kart" style={{ marginBottom: 0 }}>
          <div style={{ color: "#6b7f7f", fontSize: 13 }}>Bekleyen</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#2563eb" }}>{bekleyen}</div>
        </div>
        <div className="kart" style={{ marginBottom: 0 }}>
          <div style={{ color: "#6b7f7f", fontSize: 13 }}>Bekleme Odasında</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0891b2" }}>{gelen}</div>
        </div>
      </div>

      <div className="kart">
        <h2>Bugünkü Randevular</h2>
        <table>
          <thead>
            <tr>
              <th>Saat</th><th>Hasta</th><th>Telefon</th>
              <th>Doktor</th><th>Branş</th><th>Durum</th><th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((r) => (
              <tr key={r.id}>
                <td><strong style={{ fontSize: 17 }}>{saatFormat(r.starts_at)}</strong></td>
                <td>{r.patient_name}</td>
                <td>{r.patient_phone}</td>
                <td>{r.doctor_name}</td>
                <td>{r.branch}</td>
                <td><span className={"rozet " + r.status}>{RANDEVU_DURUMLARI[r.status]}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    {r.status === "planlandi" && (
                      <>
                        <button className="kucuk" onClick={() => durumGuncelle(r.id, "geldi")}>
                          Check-in
                        </button>
                        <button className="kucuk ikincil" onClick={() => durumGuncelle(r.id, "gelmedi")}>
                          Gelmedi
                        </button>
                        <button className="kucuk kirmizi" onClick={() => durumGuncelle(r.id, "iptal")}>
                          İptal
                        </button>
                      </>
                    )}
                    {r.status === "geldi" && (
                      <span style={{ color: "#0891b2", fontWeight: 600 }}>Bekleme odasında</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {liste.length === 0 && <div className="bos">Bugün için randevu bulunmuyor.</div>}
      </div>
    </div>
  );
}

export default BugunkuRandevular;
