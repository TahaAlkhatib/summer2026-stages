import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import {
  CINSIYET_ETIKETLERI, DurumRozeti, paraFormat, tarihFormat, tarihSaatFormat, yasHesapla,
} from "../ortak";

function PatientDetail() {
  const { id } = useParams();
  const [hasta, setHasta] = useState(null);
  const [kayitlar, setKayitlar] = useState([]);
  const [faturalar, setFaturalar] = useState([]);
  const [hata, setHata] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/patients/" + id).then((c) => setHasta(c.data)).catch((e) => setHata(hataMesaji(e)));
    api.get("/records", { params: { patientId: id } }).then((c) => setKayitlar(c.data)).catch(() => {});
    api.get("/invoices", { params: { patientId: id } }).then((c) => setFaturalar(c.data)).catch(() => {});
  }, [id]);

  if (!hasta) return hata ? <div className="hata">{hata}</div> : <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>{hasta.fullName}</h1>

      {hasta.allergies && (
        <div className="uyari">
          <strong>Dikkat — Bilinen alerjiler:</strong> {hasta.allergies}
        </div>
      )}

      <div className="satir">
        <div className="kart">
          <h2>Hasta Bilgileri</h2>
          <p><strong>TC Kimlik No:</strong> {hasta.nationalId}</p>
          <p><strong>Telefon:</strong> {hasta.phone}</p>
          <p><strong>Doğum Tarihi:</strong> {tarihFormat(hasta.birthDate)} ({yasHesapla(hasta.birthDate)})</p>
          <p><strong>Cinsiyet:</strong> {CINSIYET_ETIKETLERI[hasta.gender] || "-"}</p>
          <p><strong>Kan Grubu:</strong> {hasta.bloodType || "-"}</p>
          <p><strong>Adres:</strong> {hasta.address || "-"}</p>
        </div>

        <div className="kart">
          <h2>Randevu Geçmişi</h2>
          {hasta.appointments.length === 0 ? (
            <div className="bos">Randevu kaydı yok.</div>
          ) : (
            <table>
              <thead>
                <tr><th>Tarih</th><th>Doktor</th><th>Branş</th><th>Durum</th></tr>
              </thead>
              <tbody>
                {hasta.appointments.map((r) => (
                  <tr key={r.id}>
                    <td>{tarihSaatFormat(r.starts_at)}</td>
                    <td>{r.doctor_name}</td>
                    <td>{r.branch}</td>
                    <td><DurumRozeti durum={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="kart">
        <h2>Tıbbi Geçmiş ve Reçeteler</h2>
        {kayitlar.length === 0 ? (
          <div className="bos">Muayene kaydı bulunmuyor.</div>
        ) : (
          kayitlar.map((k) => (
            <div key={k.id} style={{
              borderLeft: "3px solid #0f766e", paddingLeft: 16, marginBottom: 22,
            }}>
              <div style={{ color: "#6b7f7f", fontSize: 13 }}>
                {tarihSaatFormat(k.created_at)} — {k.doctor_name} ({k.branch})
              </div>
              <p style={{ margin: "6px 0" }}><strong>Şikayet:</strong> {k.complaint}</p>
              {k.diagnosis && <p style={{ margin: "6px 0" }}><strong>Tanı:</strong> {k.diagnosis}</p>}
              {k.treatment_note && (
                <p style={{ margin: "6px 0" }}><strong>Tedavi Notu:</strong> {k.treatment_note}</p>
              )}
              {k.prescriptions && k.prescriptions.length > 0 && (
                <table style={{ marginTop: 10 }}>
                  <thead>
                    <tr><th>İlaç</th><th>Kullanım</th><th>Gün</th></tr>
                  </thead>
                  <tbody>
                    {k.prescriptions.map((r) => (
                      <tr key={r.id}>
                        <td>{r.medicine_name}</td>
                        <td>{r.dosage}</td>
                        <td>{r.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
      </div>

      <div className="kart">
        <h2>Faturalar</h2>
        {faturalar.length === 0 ? (
          <div className="bos">Fatura bulunmuyor.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fatura No</th><th>Açıklama</th><th>Seans</th>
                <th>Toplam</th><th>Ödenen</th><th>Kalan</th>
              </tr>
            </thead>
            <tbody>
              {faturalar.map((f) => (
                <tr key={f.id} className="tiklanabilir"
                    onClick={() => navigate("/faturalar/" + f.id)}>
                  <td><strong>{f.invoice_no}</strong></td>
                  <td>{f.description}</td>
                  <td>{f.paid_session_count} / {f.session_count}</td>
                  <td>{paraFormat(f.total_amount)}</td>
                  <td>{paraFormat(f.paid_amount)}</td>
                  <td style={{ color: f.remaining > 0 ? "#b91c1c" : "#15803d" }}>
                    {paraFormat(f.remaining)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PatientDetail;
