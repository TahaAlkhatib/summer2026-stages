import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getUser, hataMesaji } from "../api";
import { DurumRozeti, RANDEVU_DURUMLARI, saatFormat, tarihFormat, yerelTarih } from "../ortak";

function Appointments() {
  const [liste, setListe] = useState([]);
  const [doktorlar, setDoktorlar] = useState([]);
  const [tarih, setTarih] = useState(yerelTarih());
  const [doktor, setDoktor] = useState("");
  const [durum, setDurum] = useState("");
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const navigate = useNavigate();
  const kullanici = getUser();

  function yukle() {
    const p = new URLSearchParams();
    if (tarih) p.set("date", tarih);
    if (doktor) p.set("doctorId", doktor);
    if (durum) p.set("status", durum);
    api.get("/appointments?" + p.toString())
      .then((c) => setListe(c.data))
      .catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { yukle(); }, [tarih, doktor, durum]);
  useEffect(() => {
    api.get("/doctors").then((c) => setDoktorlar(c.data)).catch(() => {});
  }, []);

  async function durumGuncelle(id, yeniDurum) {
    setHata("");
    setBasarili("");
    try {
      await api.put("/appointments/" + id + "/status", { status: yeniDurum });
      setBasarili("Randevu durumu güncellendi.");
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Randevular</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="filtreler">
        <div>
          <label>Tarih</label>
          <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Doktor</label>
          <select value={doktor} onChange={(e) => setDoktor(e.target.value)}>
            <option value="">Tümü</option>
            {doktorlar.map((d) => (
              <option key={d.id} value={d.id}>{d.full_name} — {d.branch}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Durum</label>
          <select value={durum} onChange={(e) => setDurum(e.target.value)}>
            <option value="">Tümü</option>
            {Object.keys(RANDEVU_DURUMLARI).map((d) => (
              <option key={d} value={d}>{RANDEVU_DURUMLARI[d]}</option>
            ))}
          </select>
        </div>
        <button className="ikincil" onClick={() => { setTarih(""); setDoktor(""); setDurum(""); }}>
          Temizle
        </button>
      </div>

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Saat</th><th>Hasta</th><th>Telefon</th><th>Doktor</th>
              <th>Branş</th><th>Durum</th><th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{saatFormat(r.starts_at)}</strong>
                  <div style={{ fontSize: 12, color: "#6b7f7f" }}>{tarihFormat(r.starts_at)}</div>
                </td>
                <td
                  className="tiklanabilir"
                  onClick={() => navigate("/hastalar/" + r.patient_id)}
                  style={{ cursor: "pointer", color: "#0f766e" }}
                >
                  {r.patient_name}
                </td>
                <td>{r.patient_phone}</td>
                <td>{r.doctor_name}</td>
                <td>{r.branch}</td>
                <td><DurumRozeti durum={r.status} /></td>
                <td>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {r.status === "planlandi" && (
                      <>
                        <button className="kucuk" onClick={() => durumGuncelle(r.id, "geldi")}>
                          Geldi
                        </button>
                        <button className="kucuk kirmizi" onClick={() => durumGuncelle(r.id, "iptal")}>
                          İptal
                        </button>
                      </>
                    )}
                    {r.status === "geldi" && kullanici.role !== "resepsiyon" && (
                      <button className="kucuk" onClick={() => navigate("/muayene/" + r.id)}>
                        Muayene
                      </button>
                    )}
                    {r.status === "geldi" && kullanici.role === "resepsiyon" && (
                      <span style={{ color: "#6b7f7f", fontSize: 13 }}>Doktor bekleniyor</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {liste.length === 0 && <div className="bos">Bu kriterlerde randevu bulunamadı.</div>}
      </div>
    </div>
  );
}

export default Appointments;
