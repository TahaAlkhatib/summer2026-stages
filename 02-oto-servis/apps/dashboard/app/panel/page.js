"use client";

import { useEffect, useState } from "react";
import { api, paraFormat, DURUM_ETIKETLERI } from "@/lib/api";

export default function Panel() {
  const [ozet, setOzet] = useState(null);
  const [teknisyenler, setTeknisyenler] = useState([]);
  const [hata, setHata] = useState("");

  useEffect(() => {
    api.get("/reports/summary").then(setOzet).catch((e) => setHata(e.message));
    api.get("/reports/technicians").then(setTeknisyenler).catch(() => {});
  }, []);

  if (hata) return <div className="hata">{hata}</div>;
  if (!ozet) return <div>Yükleniyor...</div>;

  const durumlar = ["acildi", "incelemede", "onay_bekliyor", "tamirde", "tamamlandi", "teslim_edildi"];

  return (
    <div>
      <h1>Panel</h1>

      <div className="kutular">
        <div className="kutu">
          <div className="baslik">Bugün Açılan İş Emri</div>
          <div className="deger">{ozet.today_opened}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Bu Ay Ciro</div>
          <div className="deger">{paraFormat(ozet.month_revenue)}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Tahsil Edilmemiş</div>
          <div className="deger">{paraFormat(ozet.unpaid_total)}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Kritik Stok</div>
          <div className="deger">{ozet.low_stock_count}</div>
        </div>
      </div>

      <div className="kart">
        <h2>Durumlara Göre İş Emirleri</h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {durumlar.map((d) => (
            <div key={d} style={{ textAlign: "center" }}>
              <div className={"rozet " + d}>{DURUM_ETIKETLERI[d]}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
                {ozet.status_counts[d] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kart">
        <h2>En Çok Kullanılan Parçalar</h2>
        <table>
          <thead>
            <tr><th>Parça</th><th>Toplam Adet</th><th>Tutar</th></tr>
          </thead>
          <tbody>
            {ozet.top_parts.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.total_quantity}</td>
                <td>{paraFormat(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ozet.top_parts.length === 0 && <div className="bos">Henüz parça kullanılmadı.</div>}
      </div>

      <div className="kart">
        <h2>Teknisyen Durumu</h2>
        <table>
          <thead>
            <tr><th>Teknisyen</th><th>Açık İş</th><th>Tamamlanan</th><th>Toplam Tutar</th></tr>
          </thead>
          <tbody>
            {teknisyenler.map((t) => (
              <tr key={t.id}>
                <td>{t.full_name}</td>
                <td>{t.open_jobs}</td>
                <td>{t.completed_jobs}</td>
                <td>{paraFormat(t.total_revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
