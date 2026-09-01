"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function YeniIsEmri() {
  const [plakaArama, setPlakaArama] = useState("");
  const [araclar, setAraclar] = useState([]);
  const [secilenArac, setSecilenArac] = useState(null);
  const [teknisyenler, setTeknisyenler] = useState([]);

  const [sikayet, setSikayet] = useState("");
  const [kilometre, setKilometre] = useState("");
  const [teknisyen, setTeknisyen] = useState("");

  const [hata, setHata] = useState("");
  const router = useRouter();

  useEffect(() => {
    api.get("/reports/technician-list").then(setTeknisyenler).catch(() => {});
  }, []);

  async function aracAra() {
    setHata("");
    try {
      const liste = await api.get("/vehicles?plaka=" + encodeURIComponent(plakaArama));
      setAraclar(liste);
      if (liste.length === 0) {
        setHata("Bu plakaya ait araç bulunamadı.");
      }
    } catch (e) {
      setHata(e.message);
    }
  }

  async function isEmriAc() {
    setHata("");
    try {
      const cevap = await api.post("/jobcards", {
        vehicleId: secilenArac.id,
        complaintText: sikayet,
        mileage: Number(kilometre) || 0,
        technicianId: teknisyen ? Number(teknisyen) : null,
      });
      router.push("/panel/is-emirleri/" + cevap.id);
    } catch (e) {
      setHata(e.message);
    }
  }

  return (
    <div>
      <h1>Yeni İş Emri</h1>

      {hata && <div className="hata">{hata}</div>}

      <div className="kart">
        <h2>1. Araç Seçimi</h2>

        {secilenArac ? (
          <div>
            <p style={{ marginTop: 0 }}>
              <strong>{secilenArac.plate}</strong> — {secilenArac.brand} {secilenArac.model} ({secilenArac.year})
              <br />
              <span style={{ color: "#7b8794" }}>
                {secilenArac.customer_name} — {secilenArac.customer_phone}
              </span>
            </p>
            <button className="ikincil kucuk" onClick={() => setSecilenArac(null)}>
              Aracı Değiştir
            </button>
          </div>
        ) : (
          <div>
            <div className="filtreler">
              <div style={{ flex: 3 }}>
                <label>Plaka</label>
                <input
                  value={plakaArama}
                  onChange={(e) => setPlakaArama(e.target.value.toUpperCase())}
                  placeholder="34 ABC 123"
                  onKeyDown={(e) => { if (e.key === "Enter") aracAra(); }}
                />
              </div>
              <button onClick={aracAra}>Ara</button>
            </div>

            {araclar.length > 0 && (
              <table>
                <thead>
                  <tr><th>Plaka</th><th>Araç</th><th>Yıl</th><th>Müşteri</th><th>Km</th></tr>
                </thead>
                <tbody>
                  {araclar.map((a) => (
                    <tr key={a.id} className="tiklanabilir" onClick={() => {
                      setSecilenArac(a);
                      setKilometre(String(a.mileage));
                    }}>
                      <td><strong>{a.plate}</strong></td>
                      <td>{a.brand} {a.model}</td>
                      <td>{a.year}</td>
                      <td>{a.customer_name}</td>
                      <td>{a.mileage?.toLocaleString("tr-TR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="kart">
        <h2>2. Şikayet ve Bilgiler</h2>

        <label>Müşteri Şikayeti *</label>
        <textarea
          rows="4"
          value={sikayet}
          onChange={(e) => setSikayet(e.target.value)}
          placeholder="Örn: Motorda tıkırtı sesi var, özellikle soğukken."
        />

        <div className="satir">
          <div>
            <label>Güncel Kilometre</label>
            <input type="number" value={kilometre} onChange={(e) => setKilometre(e.target.value)} />
          </div>
          <div>
            <label>Teknisyen</label>
            <select value={teknisyen} onChange={(e) => setTeknisyen(e.target.value)}>
              <option value="">Sonra atanacak</option>
              {teknisyenler.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={isEmriAc} disabled={!secilenArac || !sikayet.trim()}>
          İş Emrini Aç
        </button>
        {(!secilenArac || !sikayet.trim()) && (
          <span style={{ color: "#7b8794", marginLeft: 12, fontSize: 13 }}>
            Araç seçin ve şikayet yazın.
          </span>
        )}
      </div>
    </div>
  );
}
