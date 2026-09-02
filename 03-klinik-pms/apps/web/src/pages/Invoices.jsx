import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { paraFormat, tarihFormat } from "../ortak";

function Invoices() {
  const [liste, setListe] = useState([]);
  const [sadeceOdenmemis, setSadeceOdenmemis] = useState(false);
  const [form, setForm] = useState(null);
  const [hastaArama, setHastaArama] = useState("");
  const [hastalar, setHastalar] = useState([]);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const navigate = useNavigate();

  function yukle() {
    const p = sadeceOdenmemis ? { unpaid: "1" } : {};
    api.get("/invoices", { params: p })
      .then((c) => setListe(c.data))
      .catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { yukle(); }, [sadeceOdenmemis]);

  useEffect(() => {
    if (hastaArama.length < 2) { setHastalar([]); return; }
    api.get("/patients", { params: { q: hastaArama } })
      .then((c) => setHastalar(c.data)).catch(() => setHastalar([]));
  }, [hastaArama]);

  async function faturaKes() {
    setHata("");
    setBasarili("");
    try {
      await api.post("/invoices", {
        patientId: form.patientId,
        description: form.description,
        sessionCount: Number(form.sessionCount) || 1,
        totalAmount: Number(form.totalAmount),
      });
      setBasarili("Fatura kesildi.");
      setForm(null);
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Faturalar</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="filtreler">
        <div>
          <label style={{ fontWeight: 400 }}>
            <input type="checkbox" style={{ width: "auto", marginRight: 6, marginBottom: 0 }}
                   checked={sadeceOdenmemis}
                   onChange={(e) => setSadeceOdenmemis(e.target.checked)} />
            Sadece ödenmemiş
          </label>
        </div>
        <button onClick={() => setForm({ patientId: null, description: "", sessionCount: 1, totalAmount: "" })}>
          + Yeni Fatura
        </button>
      </div>

      {form && (
        <div className="kart">
          <h2>Yeni Fatura</h2>

          {form.patientName ? (
            <p><strong>Hasta:</strong> {form.patientName}{" "}
              <button className="ikincil kucuk" style={{ marginLeft: 8 }}
                      onClick={() => setForm({ ...form, patientId: null, patientName: null })}>
                Değiştir
              </button>
            </p>
          ) : (
            <div>
              <label>Hasta Ara</label>
              <input value={hastaArama} onChange={(e) => setHastaArama(e.target.value)}
                     placeholder="En az 2 harf yazın" />
              {hastalar.length > 0 && (
                <table>
                  <tbody>
                    {hastalar.map((h) => (
                      <tr key={h.id} className="tiklanabilir"
                          onClick={() => setForm({ ...form, patientId: h.id, patientName: h.fullName })}>
                        <td>{h.fullName}</td><td>{h.phone}</td><td>{h.nationalId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <label>Açıklama *</label>
          <input value={form.description} placeholder="Örn: Fizik tedavi paketi (10 seans)"
                 onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="satir">
            <div>
              <label>Seans Sayısı</label>
              <input type="number" min="1" value={form.sessionCount}
                     onChange={(e) => setForm({ ...form, sessionCount: e.target.value })} />
            </div>
            <div>
              <label>Toplam Tutar (₺) *</label>
              <input type="number" step="0.01" value={form.totalAmount}
                     onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} />
            </div>
          </div>

          <button onClick={faturaKes} disabled={!form.patientId || !form.description || !form.totalAmount}>
            Faturayı Kes
          </button>
          <button className="ikincil" style={{ marginLeft: 8 }} onClick={() => setForm(null)}>
            Vazgeç
          </button>
        </div>
      )}

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Fatura No</th><th>Hasta</th><th>Açıklama</th><th>Seans</th>
              <th>Toplam</th><th>Ödenen</th><th>Kalan</th><th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((f) => (
              <tr key={f.id} className="tiklanabilir" onClick={() => navigate("/faturalar/" + f.id)}>
                <td><strong>{f.invoice_no}</strong></td>
                <td>{f.patient_name}</td>
                <td>{f.description}</td>
                <td>{f.paid_session_count} / {f.session_count}</td>
                <td>{paraFormat(f.total_amount)}</td>
                <td>{paraFormat(f.paid_amount)}</td>
                <td style={{ color: f.remaining > 0 ? "#b91c1c" : "#15803d", fontWeight: 600 }}>
                  {paraFormat(f.remaining)}
                </td>
                <td>{tarihFormat(f.issue_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {liste.length === 0 && <div className="bos">Kayıt bulunamadı.</div>}
      </div>
    </div>
  );
}

export default Invoices;
