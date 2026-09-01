"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, paraFormat, tarihFormat } from "@/lib/api";

export default function Faturalar() {
  const [liste, setListe] = useState([]);
  const [filtre, setFiltre] = useState("");
  const [hata, setHata] = useState("");
  const router = useRouter();

  useEffect(() => {
    const p = filtre ? "?isPaid=" + filtre : "";
    api.get("/invoices" + p).then(setListe).catch((e) => setHata(e.message));
  }, [filtre]);

  return (
    <div>
      <h1>Faturalar</h1>

      {hata && <div className="hata">{hata}</div>}

      <div className="filtreler">
        <div style={{ flex: 1 }}>
          <label>Ödeme Durumu</label>
          <select value={filtre} onChange={(e) => setFiltre(e.target.value)}>
            <option value="">Tümü</option>
            <option value="0">Ödenmemiş</option>
            <option value="1">Ödenmiş</option>
          </select>
        </div>
      </div>

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Fatura No</th><th>İş Emri</th><th>Plaka</th><th>Müşteri</th>
              <th>Tarih</th><th>KDV</th><th>Toplam</th><th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((f) => (
              <tr key={f.id} className="tiklanabilir"
                  onClick={() => router.push("/panel/faturalar/" + f.id)}>
                <td><strong>{f.invoice_no}</strong></td>
                <td>{f.job_no}</td>
                <td>{f.plate}</td>
                <td>{f.customer_name}</td>
                <td>{tarihFormat(f.issue_date)}</td>
                <td>{paraFormat(f.tax_amount)}</td>
                <td>{paraFormat(f.grand_total)}</td>
                <td>
                  <span className={"rozet " + (f.is_paid ? "tamamlandi" : "onay_bekliyor")}>
                    {f.is_paid ? "Ödendi" : "Ödenmedi"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {liste.length === 0 && <div className="bos">Kayıt bulunamadı.</div>}
      </div>
    </div>
  );
}
