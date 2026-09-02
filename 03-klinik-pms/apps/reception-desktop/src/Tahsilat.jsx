import { useEffect, useState } from "react";
import api, { hataMesaji, paraFormat, tarihFormat } from "./api";

// Resepsiyonda ödeme alma ekranı — ödenmemiş faturalar listelenir
function Tahsilat() {
  const [faturalar, setFaturalar] = useState([]);
  const [secilen, setSecilen] = useState(null);
  const [tutar, setTutar] = useState("");
  const [yontem, setYontem] = useState("nakit");
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  function yukle() {
    api.get("/invoices", { params: { unpaid: "1" } })
      .then((c) => setFaturalar(c.data))
      .catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { yukle(); }, []);

  async function tahsilEt() {
    setHata("");
    setBasarili("");
    try {
      const cevap = await api.post("/invoices/" + secilen.id + "/payments", {
        amount: Number(tutar),
        method: yontem,
      });
      setBasarili(
        "Tahsilat alındı: " + paraFormat(cevap.data.payment.amount) +
        " · Kalan: " + paraFormat(cevap.data.invoice.remaining)
      );
      setSecilen(null);
      setTutar("");
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      {secilen ? (
        <div className="kart">
          <h2>Tahsilat — {secilen.invoice_no}</h2>
          <p style={{ fontSize: 17 }}>
            <strong>{secilen.patient_name}</strong> — {secilen.description}
          </p>
          <p style={{ color: "#6b7f7f" }}>
            Seans: {secilen.paid_session_count} / {secilen.session_count} ·
            Toplam: {paraFormat(secilen.total_amount)} ·
            Ödenen: {paraFormat(secilen.paid_amount)}
          </p>
          <p style={{ fontSize: 19, fontWeight: 700, color: "#b91c1c" }}>
            Kalan Borç: {paraFormat(secilen.remaining)}
          </p>

          <div className="satir">
            <div>
              <label>Tahsil Edilecek Tutar (₺)</label>
              <input type="number" step="0.01" value={tutar} autoFocus
                     onChange={(e) => setTutar(e.target.value)} />
            </div>
            <div>
              <label>Ödeme Yöntemi</label>
              <select value={yontem} onChange={(e) => setYontem(e.target.value)}>
                <option value="nakit">Nakit</option>
                <option value="kart">Kart</option>
                <option value="havale">Havale</option>
              </select>
            </div>
          </div>

          <button onClick={tahsilEt} disabled={!tutar}>Tahsil Et</button>
          <button className="ikincil" style={{ marginLeft: 10 }}
                  onClick={() => setTutar(String(secilen.remaining))}>
            Tamamını Doldur
          </button>
          <button className="ikincil" style={{ marginLeft: 10 }}
                  onClick={() => { setSecilen(null); setTutar(""); }}>
            Vazgeç
          </button>
        </div>
      ) : (
        <div className="kart">
          <h2>Ödeme Bekleyen Faturalar</h2>
          <table>
            <thead>
              <tr>
                <th>Fatura No</th><th>Hasta</th><th>Açıklama</th>
                <th>Seans</th><th>Kalan</th><th>Tarih</th><th></th>
              </tr>
            </thead>
            <tbody>
              {faturalar.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.invoice_no}</strong></td>
                  <td>{f.patient_name}</td>
                  <td>{f.description}</td>
                  <td>{f.paid_session_count} / {f.session_count}</td>
                  <td style={{ color: "#b91c1c", fontWeight: 600 }}>{paraFormat(f.remaining)}</td>
                  <td>{tarihFormat(f.issue_date)}</td>
                  <td>
                    <button className="kucuk" onClick={() => { setSecilen(f); setTutar(""); }}>
                      Tahsil Et
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {faturalar.length === 0 && (
            <div className="bos">Ödeme bekleyen fatura bulunmuyor.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Tahsilat;
