import { useEffect, useState } from "react";
import api, { hataMesaji } from "../api";
import { paraFormat, RANDEVU_DURUMLARI } from "../ortak";

function Dashboard() {
  const [ozet, setOzet] = useState(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    api.get("/reports/summary").then((c) => setOzet(c.data)).catch((e) => setHata(hataMesaji(e)));
  }, []);

  if (hata) return <div className="hata">{hata}</div>;
  if (!ozet) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>Panel</h1>

      <div className="kutular">
        <div className="kutu">
          <div className="baslik">Bugünkü Randevu</div>
          <div className="deger">{ozet.today_appointments}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Kayıtlı Hasta</div>
          <div className="deger">{ozet.patient_count}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Bu Ay Tahsilat</div>
          <div className="deger">{paraFormat(ozet.month_collected)}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Tahsil Edilmemiş</div>
          <div className="deger">{paraFormat(ozet.unpaid_total)}</div>
        </div>
      </div>

      <div className="kart">
        <h2>Bugünkü Randevu Durumları</h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {Object.keys(RANDEVU_DURUMLARI).map((d) => (
            <div key={d} style={{ textAlign: "center" }}>
              <div className={"rozet " + d}>{RANDEVU_DURUMLARI[d]}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
                {ozet.today_status_counts[d] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kart">
        <h2>Kritik Stok ({ozet.low_stock_count})</h2>
        {ozet.low_stock_items.length === 0 ? (
          <div className="bos">Kritik seviyede malzeme yok.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Malzeme</th><th>Mevcut</th><th>Minimum</th></tr>
            </thead>
            <tbody>
              {ozet.low_stock_items.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td className="dusuk-stok">{m.stock_quantity}</td>
                  <td>{m.min_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
