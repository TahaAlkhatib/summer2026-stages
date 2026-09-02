import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { paraFormat, tarihFormat, tarihSaatFormat } from "../ortak";

const YONTEM_ETIKETLERI = { nakit: "Nakit", kart: "Kart", havale: "Havale" };

function InvoiceDetail() {
  const { id } = useParams();
  const [fatura, setFatura] = useState(null);
  const [tutar, setTutar] = useState("");
  const [yontem, setYontem] = useState("nakit");
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  function yukle() {
    api.get("/invoices/" + id).then((c) => setFatura(c.data)).catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { yukle(); }, [id]);

  async function tahsilEt() {
    setHata("");
    setBasarili("");
    try {
      await api.post("/invoices/" + id + "/payments", {
        amount: Number(tutar),
        method: yontem,
      });
      setBasarili("Tahsilat kaydedildi.");
      setTutar("");
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  if (!fatura) return hata ? <div className="hata">{hata}</div> : <div>Yükleniyor...</div>;

  // Kalan seans başına düşen tutar önerisi
  const kalanSeans = fatura.session_count - fatura.paid_session_count;
  const seansTutari = fatura.session_count > 0
    ? (fatura.total_amount / fatura.session_count).toFixed(2)
    : fatura.remaining.toFixed(2);

  return (
    <div>
      <h1>Fatura — {fatura.invoice_no}</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="filtreler">
        <button onClick={() => window.print()}>Yazdır</button>
      </div>

      <div className="satir">
        <div className="kart">
          <h2>Hasta</h2>
          <p><strong>{fatura.patient.full_name}</strong></p>
          <p style={{ color: "#6b7f7f", margin: "4px 0" }}>TC: {fatura.patient.national_id}</p>
          <p style={{ color: "#6b7f7f", margin: "4px 0" }}>{fatura.patient.phone}</p>
          <p style={{ color: "#6b7f7f", margin: "4px 0" }}>{fatura.patient.address}</p>
        </div>

        <div className="kart">
          <h2>Fatura Bilgileri</h2>
          <p><strong>Açıklama:</strong> {fatura.description}</p>
          <p><strong>Tarih:</strong> {tarihFormat(fatura.issue_date)}</p>
          <p><strong>Seans:</strong> {fatura.paid_session_count} / {fatura.session_count} ödendi</p>
          <p><strong>Durum:</strong>{" "}
            <span className={"rozet " + (fatura.is_paid ? "tamamlandi" : "planlandi")}>
              {fatura.is_paid ? "Tamamı Ödendi" : "Ödeme Bekliyor"}
            </span>
          </p>
        </div>
      </div>

      <div className="kart">
        <h2>Tutar</h2>
        <table>
          <tbody>
            <tr><td>Toplam Tutar</td><td>{paraFormat(fatura.total_amount)}</td></tr>
            <tr><td>Tahsil Edilen</td><td>{paraFormat(fatura.paid_amount)}</td></tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Kalan Borç</th>
              <th style={{ color: fatura.remaining > 0 ? "#b91c1c" : "#15803d" }}>
                {paraFormat(fatura.remaining)}
              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="kart">
        <h2>Tahsilat Geçmişi</h2>
        {fatura.payments.length === 0 ? (
          <div className="bos">Henüz tahsilat yapılmadı.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Seans</th><th>Tutar</th><th>Yöntem</th><th>Tarih</th></tr>
            </thead>
            <tbody>
              {fatura.payments.map((o) => (
                <tr key={o.id}>
                  <td>{o.session_no}. seans</td>
                  <td>{paraFormat(o.amount)}</td>
                  <td>{YONTEM_ETIKETLERI[o.method] || o.method}</td>
                  <td>{tarihSaatFormat(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {fatura.remaining > 0 && (
        <div className="kart">
          <h2>Yeni Tahsilat</h2>
          <p style={{ color: "#6b7f7f", marginTop: 0 }}>
            {kalanSeans > 0
              ? `Kalan ${kalanSeans} seans · seans başına ${paraFormat(seansTutari)}`
              : "Seanslar tamamlandı, kalan borç tahsil edilebilir."}
          </p>
          <div className="satir">
            <div>
              <label>Tutar (₺)</label>
              <input type="number" step="0.01" value={tutar}
                     placeholder={seansTutari}
                     onChange={(e) => setTutar(e.target.value)} />
            </div>
            <div>
              <label>Yöntem</label>
              <select value={yontem} onChange={(e) => setYontem(e.target.value)}>
                <option value="nakit">Nakit</option>
                <option value="kart">Kart</option>
                <option value="havale">Havale</option>
              </select>
            </div>
          </div>
          <button onClick={tahsilEt} disabled={!tutar}>Tahsil Et</button>
          <button className="ikincil" style={{ marginLeft: 8 }}
                  onClick={() => setTutar(seansTutari)}>
            Seans Tutarını Doldur
          </button>
        </div>
      )}
    </div>
  );
}

export default InvoiceDetail;
