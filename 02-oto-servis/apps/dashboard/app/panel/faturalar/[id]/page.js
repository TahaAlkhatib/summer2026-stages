"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, paraFormat, tarihFormat } from "@/lib/api";

export default function FaturaDetay() {
  const { id } = useParams();
  const [fatura, setFatura] = useState(null);
  const [hata, setHata] = useState("");

  function yukle() {
    api.get("/invoices/" + id).then(setFatura).catch((e) => setHata(e.message));
  }

  useEffect(() => { yukle(); }, [id]);

  async function odendiIsaretle() {
    setHata("");
    try {
      await api.put("/invoices/" + id + "/pay");
      yukle();
    } catch (e) {
      setHata(e.message);
    }
  }

  if (!fatura) {
    return hata ? <div className="hata">{hata}</div> : <div>Yükleniyor...</div>;
  }

  return (
    <div>
      {hata && <div className="hata">{hata}</div>}

      <div className="filtreler">
        <button onClick={() => window.print()}>Yazdır</button>
        {!fatura.is_paid && (
          <button className="ikincil" onClick={odendiIsaretle}>Ödendi Olarak İşaretle</button>
        )}
      </div>

      <div className="kart fatura">
        <div className="ust">
          <div>
            <h1>SERVİS FATURASI</h1>
            <p style={{ color: "#7b8794", margin: 0 }}>Oto Servis &amp; Bakım Merkezi</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0 }}><strong>{fatura.invoice_no}</strong></p>
            <p style={{ margin: 0 }}>{tarihFormat(fatura.issue_date)}</p>
            <p style={{ margin: 0 }}>İş Emri: {fatura.job_no}</p>
            <p style={{ margin: "8px 0 0" }}>
              <span className={"rozet " + (fatura.is_paid ? "tamamlandi" : "onay_bekliyor")}>
                {fatura.is_paid ? "Ödendi" : "Ödenmedi"}
              </span>
            </p>
          </div>
        </div>

        <div className="satir">
          <div>
            <h2>Müşteri</h2>
            <p style={{ margin: 0 }}>{fatura.customer.full_name}</p>
            <p style={{ margin: 0, color: "#7b8794" }}>{fatura.customer.phone}</p>
            <p style={{ margin: 0, color: "#7b8794" }}>{fatura.customer.address}</p>
          </div>
          <div>
            <h2>Araç</h2>
            <p style={{ margin: 0 }}>
              <strong>{fatura.vehicle.plate}</strong> — {fatura.vehicle.brand} {fatura.vehicle.model} ({fatura.vehicle.year})
            </p>
            <p style={{ margin: 0, color: "#7b8794" }}>
              Kilometre: {fatura.mileage?.toLocaleString("tr-TR")} km
            </p>
          </div>
        </div>

        <h2 style={{ marginTop: 24 }}>Şikayet</h2>
        <p>{fatura.complaint_text}</p>

        <h2>Kullanılan Parçalar</h2>
        <table>
          <thead>
            <tr><th>Kod</th><th>Parça</th><th>Adet</th><th>Birim Fiyat</th><th>Tutar</th></tr>
          </thead>
          <tbody>
            {fatura.parts.map((p, i) => (
              <tr key={i}>
                <td>{p.code}</td><td>{p.name}</td><td>{p.quantity}</td>
                <td>{paraFormat(p.unit_price)}</td><td>{paraFormat(p.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {fatura.parts.length === 0 && <div className="bos">Parça kullanılmadı.</div>}

        <h2 style={{ marginTop: 20 }}>İşçilik</h2>
        <table>
          <thead>
            <tr><th>Açıklama</th><th>Saat</th><th>Saat Ücreti</th><th>Tutar</th></tr>
          </thead>
          <tbody>
            {fatura.labor.map((l, i) => (
              <tr key={i}>
                <td>{l.description}</td><td>{l.hours}</td>
                <td>{paraFormat(l.hourly_rate)}</td><td>{paraFormat(l.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {fatura.labor.length === 0 && <div className="bos">İşçilik girilmedi.</div>}

        <table className="toplamlar">
          <tbody>
            <tr><td>Parça Toplamı</td><td>{paraFormat(fatura.parts_total)}</td></tr>
            <tr><td>İşçilik Toplamı</td><td>{paraFormat(fatura.labor_total)}</td></tr>
            <tr><td>Ara Toplam</td><td>{paraFormat(fatura.parts_total + fatura.labor_total)}</td></tr>
            <tr><td>KDV (%{fatura.tax_rate})</td><td>{paraFormat(fatura.tax_amount)}</td></tr>
          </tbody>
          <tfoot>
            <tr><th>GENEL TOPLAM</th><th>{paraFormat(fatura.grand_total)}</th></tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
