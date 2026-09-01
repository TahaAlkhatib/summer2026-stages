"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, paraFormat, tarihFormat, DURUM_ETIKETLERI } from "@/lib/api";

export default function IsEmirleri() {
  const [liste, setListe] = useState([]);
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("");
  const [hata, setHata] = useState("");
  const router = useRouter();

  useEffect(() => {
    const parametreler = new URLSearchParams();
    if (arama) parametreler.set("q", arama);
    if (durum) parametreler.set("status", durum);

    api.get("/jobcards?" + parametreler.toString())
      .then(setListe)
      .catch((e) => setHata(e.message));
  }, [arama, durum]);

  return (
    <div>
      <h1>İş Emirleri</h1>

      <div className="filtreler">
        <div style={{ flex: 2 }}>
          <label>Ara</label>
          <input
            placeholder="İş emri no, plaka veya müşteri"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Durum</label>
          <select value={durum} onChange={(e) => setDurum(e.target.value)}>
            <option value="">Tümü</option>
            {Object.keys(DURUM_ETIKETLERI).map((d) => (
              <option key={d} value={d}>{DURUM_ETIKETLERI[d]}</option>
            ))}
          </select>
        </div>
        <button className="ikincil" onClick={() => { setArama(""); setDurum(""); }}>
          Temizle
        </button>
      </div>

      {hata && <div className="hata">{hata}</div>}

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>İş Emri No</th>
              <th>Plaka</th>
              <th>Araç</th>
              <th>Müşteri</th>
              <th>Durum</th>
              <th>Tutar</th>
              <th>Açılış</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((j) => (
              <tr key={j.id} className="tiklanabilir"
                  onClick={() => router.push("/panel/is-emirleri/" + j.id)}>
                <td><strong>{j.job_no}</strong></td>
                <td>{j.plate}</td>
                <td>{j.brand} {j.model}</td>
                <td>{j.customer_name}</td>
                <td><span className={"rozet " + j.status}>{DURUM_ETIKETLERI[j.status]}</span></td>
                <td>{paraFormat(j.grand_total)}</td>
                <td>{tarihFormat(j.opened_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {liste.length === 0 && <div className="bos">Kayıt bulunamadı.</div>}
      </div>
    </div>
  );
}
