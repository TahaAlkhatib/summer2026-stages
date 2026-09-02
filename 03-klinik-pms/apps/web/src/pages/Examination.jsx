import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { tarihSaatFormat, yasHesapla } from "../ortak";

function Examination() {
  const { randevuId } = useParams();
  const [randevu, setRandevu] = useState(null);
  const [sikayet, setSikayet] = useState("");
  const [tani, setTani] = useState("");
  const [tedaviNotu, setTedaviNotu] = useState("");
  const [receteler, setReceteler] = useState([]);
  const [ilac, setIlac] = useState("");
  const [doz, setDoz] = useState("");
  const [gun, setGun] = useState("7");
  const [hata, setHata] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/appointments/" + randevuId)
      .then((c) => setRandevu(c.data))
      .catch((e) => setHata(hataMesaji(e)));
  }, [randevuId]);

  function receteEkle() {
    if (!ilac.trim() || !doz.trim()) {
      setHata("İlaç adı ve kullanım şekli zorunludur.");
      return;
    }
    setHata("");
    setReceteler([...receteler, { medicineName: ilac, dosage: doz, days: Number(gun) || 7 }]);
    setIlac("");
    setDoz("");
    setGun("7");
  }

  async function muayeneyiKaydet() {
    setHata("");
    try {
      await api.post("/records", {
        appointmentId: Number(randevuId),
        complaint: sikayet,
        diagnosis: tani,
        treatmentNote: tedaviNotu,
        prescriptions: receteler,
      });
      navigate("/hastalar/" + randevu.patientId);
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  if (!randevu) return hata ? <div className="hata">{hata}</div> : <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>Muayene</h1>
      {hata && <div className="hata">{hata}</div>}

      <div className="kart">
        <h2>Hasta</h2>
        <p style={{ marginTop: 0 }}>
          <strong>{randevu.patient?.fullName}</strong> — {randevu.patient?.phone}
          <br />
          <span style={{ color: "#6b7f7f" }}>
            TC: {randevu.patient?.nationalId} · {yasHesapla(randevu.patient?.birthDate)} ·
            Kan grubu: {randevu.patient?.bloodType || "-"}
          </span>
          <br />
          <span style={{ color: "#6b7f7f" }}>
            Randevu: {tarihSaatFormat(randevu.startsAt)} — {randevu.doctor?.branch}
          </span>
        </p>
        {randevu.patient?.allergies && (
          <div className="uyari" style={{ marginBottom: 0 }}>
            <strong>Alerji uyarısı:</strong> {randevu.patient.allergies}
          </div>
        )}
      </div>

      <div className="kart">
        <h2>Muayene Bilgileri</h2>
        <label>Hasta Şikayeti *</label>
        <textarea rows="3" value={sikayet} onChange={(e) => setSikayet(e.target.value)} />

        <label>Tanı</label>
        <input value={tani} onChange={(e) => setTani(e.target.value)}
               placeholder="Örn: Üst solunum yolu enfeksiyonu" />

        <label>Tedavi Notu</label>
        <textarea rows="3" value={tedaviNotu} onChange={(e) => setTedaviNotu(e.target.value)} />
      </div>

      <div className="kart">
        <h2>Reçete</h2>
        {receteler.length > 0 && (
          <table>
            <thead>
              <tr><th>İlaç</th><th>Kullanım</th><th>Gün</th><th></th></tr>
            </thead>
            <tbody>
              {receteler.map((r, i) => (
                <tr key={i}>
                  <td>{r.medicineName}</td>
                  <td>{r.dosage}</td>
                  <td>{r.days}</td>
                  <td>
                    <button className="kirmizi kucuk"
                            onClick={() => setReceteler(receteler.filter((x, j) => j !== i))}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="filtreler" style={{ marginTop: 14 }}>
          <div style={{ flex: 2 }}>
            <label>İlaç Adı</label>
            <input value={ilac} onChange={(e) => setIlac(e.target.value)}
                   placeholder="Örn: Amoksisilin 1000 mg" />
          </div>
          <div style={{ flex: 2 }}>
            <label>Kullanım Şekli</label>
            <input value={doz} onChange={(e) => setDoz(e.target.value)}
                   placeholder="Örn: Günde 2 kez, 1 tablet" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Gün</label>
            <input type="number" value={gun} onChange={(e) => setGun(e.target.value)} />
          </div>
          <button onClick={receteEkle}>Ekle</button>
        </div>
      </div>

      <div className="kart">
        <button onClick={muayeneyiKaydet} disabled={!sikayet.trim()}>
          Muayeneyi Tamamla ve Kaydet
        </button>
        {!sikayet.trim() && (
          <span style={{ color: "#6b7f7f", marginLeft: 12, fontSize: 13 }}>
            Hasta şikayeti yazılmalıdır.
          </span>
        )}
        <p style={{ color: "#6b7f7f", fontSize: 13, marginBottom: 0 }}>
          Muayene kaydedildiğinde randevu otomatik olarak &quot;Tamamlandı&quot; durumuna geçer.
        </p>
      </div>
    </div>
  );
}

export default Examination;
