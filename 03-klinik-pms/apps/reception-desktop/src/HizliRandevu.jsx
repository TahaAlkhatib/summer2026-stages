import { useEffect, useState } from "react";
import api, { hataMesaji, yerelTarih } from "./api";

// Resepsiyonda hasta karşısındayken hızlı randevu açma ekranı
function HizliRandevu() {
  const [arama, setArama] = useState("");
  const [hastalar, setHastalar] = useState([]);
  const [secilenHasta, setSecilenHasta] = useState(null);

  const [doktorlar, setDoktorlar] = useState([]);
  const [doktor, setDoktor] = useState("");
  const [tarih, setTarih] = useState(yerelTarih());
  const [slotlar, setSlotlar] = useState([]);
  const [saat, setSaat] = useState("");

  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  useEffect(() => {
    api.get("/doctors").then((c) => setDoktorlar(c.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (arama.length < 2) { setHastalar([]); return; }
    api.get("/patients", { params: { q: arama } })
      .then((c) => setHastalar(c.data)).catch(() => setHastalar([]));
  }, [arama]);

  useEffect(() => {
    if (!doktor) { setSlotlar([]); return; }
    setSaat("");
    api.get("/doctors/" + doktor + "/slots", { params: { date: tarih } })
      .then((c) => setSlotlar(c.data.slots))
      .catch((e) => setHata(hataMesaji(e)));
  }, [doktor, tarih]);

  async function randevuAc() {
    setHata("");
    setBasarili("");
    try {
      await api.post("/appointments", {
        patientId: secilenHasta.id,
        doctorId: Number(doktor),
        startsAt: tarih + "T" + saat + ":00",
      });
      setBasarili(
        "Randevu oluşturuldu: " + secilenHasta.fullName + " — " + tarih + " " + saat
      );
      setSecilenHasta(null);
      setArama("");
      setSaat("");
      // Slotları tazele
      const c = await api.get("/doctors/" + doktor + "/slots", { params: { date: tarih } });
      setSlotlar(c.data.slots);
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="kart">
        <h2>1. Hasta Seç</h2>
        {secilenHasta ? (
          <div>
            <p style={{ marginTop: 0, fontSize: 17 }}>
              <strong>{secilenHasta.fullName}</strong> — {secilenHasta.phone}
              <span style={{ color: "#6b7f7f" }}> · TC: {secilenHasta.nationalId}</span>
            </p>
            <button className="ikincil kucuk" onClick={() => setSecilenHasta(null)}>
              Değiştir
            </button>
          </div>
        ) : (
          <div>
            <input value={arama} onChange={(e) => setArama(e.target.value)}
                   placeholder="Hasta adı, telefon veya TC kimlik no (en az 2 harf)" autoFocus />
            {hastalar.length > 0 && (
              <table>
                <tbody>
                  {hastalar.map((h) => (
                    <tr key={h.id} style={{ cursor: "pointer" }} onClick={() => setSecilenHasta(h)}>
                      <td>{h.fullName}</td>
                      <td>{h.phone}</td>
                      <td>{h.nationalId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="kart">
        <h2>2. Doktor ve Saat</h2>
        <div className="satir">
          <div>
            <label>Doktor</label>
            <select value={doktor} onChange={(e) => setDoktor(e.target.value)}>
              <option value="">Doktor seçin</option>
              {doktorlar.map((d) => (
                <option key={d.id} value={d.id}>{d.full_name} — {d.branch}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Tarih</label>
            <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
          </div>
        </div>

        {doktor && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 8,
          }}>
            {slotlar.map((s) => (
              <div
                key={s.time}
                onClick={() => s.available && setSaat(s.time)}
                style={{
                  padding: 12, textAlign: "center", borderRadius: 6,
                  border: "1px solid " + (saat === s.time ? "#0f766e" : "#c5d5d5"),
                  background: saat === s.time ? "#0f766e" : (s.available ? "#fff" : "#f3f4f6"),
                  color: saat === s.time ? "#fff" : (s.available ? "#1a2b2b" : "#9ca3af"),
                  cursor: s.available ? "pointer" : "not-allowed",
                  fontWeight: saat === s.time ? 700 : 400,
                }}
              >
                {s.time}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="kart">
        <button onClick={randevuAc} disabled={!secilenHasta || !doktor || !saat}
                style={{ fontSize: 17, padding: "14px 28px" }}>
          Randevuyu Oluştur
        </button>
        {(!secilenHasta || !doktor || !saat) && (
          <span style={{ color: "#6b7f7f", marginLeft: 14 }}>
            Hasta, doktor ve saat seçilmelidir.
          </span>
        )}
      </div>
    </div>
  );
}

export default HizliRandevu;
