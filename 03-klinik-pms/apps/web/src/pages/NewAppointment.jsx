import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { yerelTarih } from "../ortak";

function NewAppointment() {
  const [hastaArama, setHastaArama] = useState("");
  const [hastalar, setHastalar] = useState([]);
  const [secilenHasta, setSecilenHasta] = useState(null);

  const [doktorlar, setDoktorlar] = useState([]);
  const [doktor, setDoktor] = useState("");
  const [tarih, setTarih] = useState(yerelTarih(1));
  const [slotlar, setSlotlar] = useState([]);
  const [secilenSaat, setSecilenSaat] = useState("");
  const [not, setNot] = useState("");

  const [hata, setHata] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/doctors").then((c) => setDoktorlar(c.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (hastaArama.length < 2) {
      setHastalar([]);
      return;
    }
    api.get("/patients", { params: { q: hastaArama } })
      .then((c) => setHastalar(c.data))
      .catch(() => setHastalar([]));
  }, [hastaArama]);

  // Doktor veya tarih değişince boş saatleri getir
  useEffect(() => {
    if (!doktor || !tarih) {
      setSlotlar([]);
      return;
    }
    setSecilenSaat("");
    api.get("/doctors/" + doktor + "/slots", { params: { date: tarih } })
      .then((c) => setSlotlar(c.data.slots))
      .catch((e) => setHata(hataMesaji(e)));
  }, [doktor, tarih]);

  async function randevuOlustur() {
    setHata("");
    try {
      const cevap = await api.post("/appointments", {
        patientId: secilenHasta.id,
        doctorId: doktor,
        startsAt: tarih + "T" + secilenSaat + ":00",
        note: not,
      });
      navigate("/randevular");
      return cevap;
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Yeni Randevu</h1>
      {hata && <div className="hata">{hata}</div>}

      <div className="kart">
        <h2>1. Hasta</h2>
        {secilenHasta ? (
          <div>
            <p style={{ marginTop: 0 }}>
              <strong>{secilenHasta.fullName}</strong> — {secilenHasta.phone}
              <br />
              <span style={{ color: "#6b7f7f" }}>TC: {secilenHasta.nationalId}</span>
            </p>
            <button className="ikincil kucuk" onClick={() => setSecilenHasta(null)}>
              Hastayı Değiştir
            </button>
          </div>
        ) : (
          <div>
            <label>Hasta Ara (ad, telefon veya TC kimlik no)</label>
            <input
              value={hastaArama}
              onChange={(e) => setHastaArama(e.target.value)}
              placeholder="En az 2 harf yazın"
            />
            {hastalar.length > 0 && (
              <table>
                <tbody>
                  {hastalar.map((h) => (
                    <tr key={h.id} className="tiklanabilir" onClick={() => setSecilenHasta(h)}>
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
        <h2>2. Doktor ve Tarih</h2>
        <div className="satir">
          <div>
            <label>Doktor</label>
            <select value={doktor} onChange={(e) => setDoktor(e.target.value)}>
              <option value="">Doktor seçin</option>
              {doktorlar.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} — {d.branch} ({d.examination_fee} ₺)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Tarih</label>
            <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="kart">
        <h2>3. Saat Seçimi</h2>
        {!doktor ? (
          <div className="bos">Önce doktor ve tarih seçin.</div>
        ) : (
          <div className="slotlar">
            {slotlar.map((s) => (
              <div
                key={s.time}
                className={
                  "slot" + (!s.available ? " dolu" : "") + (secilenSaat === s.time ? " secili" : "")
                }
                onClick={() => s.available && setSecilenSaat(s.time)}
              >
                {s.time}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="kart">
        <h2>4. Not ve Onay</h2>
        <label>Randevu Notu</label>
        <textarea rows="2" value={not} onChange={(e) => setNot(e.target.value)}
                  placeholder="Örn: Aç karnına gelmesi gerekiyor." />
        <button onClick={randevuOlustur} disabled={!secilenHasta || !doktor || !secilenSaat}>
          Randevuyu Oluştur
        </button>
        {(!secilenHasta || !doktor || !secilenSaat) && (
          <span style={{ color: "#6b7f7f", marginLeft: 12, fontSize: 13 }}>
            Hasta, doktor ve saat seçilmelidir.
          </span>
        )}
      </div>
    </div>
  );
}

export default NewAppointment;
