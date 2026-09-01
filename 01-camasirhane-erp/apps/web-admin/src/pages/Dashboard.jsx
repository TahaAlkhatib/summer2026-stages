import { useEffect, useState } from "react";
import api, { hataMesaji } from "../api";
import { DURUM_ETIKETLERI, paraFormat } from "../durumlar";

function Dashboard() {
  const [ozet, setOzet] = useState(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    api.get("/reports/summary")
      .then((cevap) => setOzet(cevap.data))
      .catch((err) => setHata(hataMesaji(err)));
  }, []);

  if (hata) return <div className="hata">{hata}</div>;
  if (!ozet) return <div>Yükleniyor...</div>;

  // İptal durumunu panelde göstermiyoruz
  const durumlar = ["alindi", "yikamada", "utude", "hazir", "teslim_edildi"];

  return (
    <div>
      <h1>Panel</h1>

      <div className="ozet-kartlar">
        <div className="ozet-kart">
          <div className="baslik">Bugünkü Sipariş</div>
          <div className="deger">{ozet.today.order_count}</div>
        </div>
        <div className="ozet-kart">
          <div className="baslik">Bugünkü Ciro</div>
          <div className="deger">{paraFormat(ozet.today.total_amount)}</div>
        </div>
        <div className="ozet-kart">
          <div className="baslik">Bekleyen Kurye Görevi</div>
          <div className="deger">{ozet.pending_courier_tasks}</div>
        </div>
        <div className="ozet-kart">
          <div className="baslik">Tahsil Edilmemiş</div>
          <div className="deger">{paraFormat(ozet.unpaid_total)}</div>
        </div>
      </div>

      <div className="kart">
        <h2>Aşamalara Göre Siparişler</h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {durumlar.map((durum) => (
            <div key={durum} style={{ textAlign: "center" }}>
              <div className={"rozet " + durum}>{DURUM_ETIKETLERI[durum]}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
                {ozet.status_counts[durum]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kart">
        <h2>Bu Ay</h2>
        <p style={{ margin: 0 }}>
          {ozet.month.order_count} sipariş — toplam {paraFormat(ozet.month.total_amount)}
        </p>
      </div>

      <div className="kart">
        <h2>En Çok Gelir Getiren Hizmetler</h2>
        <table>
          <thead>
            <tr>
              <th>Hizmet</th>
              <th>Sipariş Adedi</th>
              <th>Gelir</th>
            </tr>
          </thead>
          <tbody>
            {ozet.top_services.map((h) => (
              <tr key={h.name}>
                <td>{h.name}</td>
                <td>{h.order_count}</td>
                <td>{paraFormat(h.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
