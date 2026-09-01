import { useEffect, useState } from "react";
import api, { hataMesaji } from "../api";
import { DurumRozeti, paraFormat, tarihFormat, yerelTarih } from "../durumlar";

function Reports() {
  const [tarih, setTarih] = useState(yerelTarih());
  const [rapor, setRapor] = useState(null);
  const [hata, setHata] = useState("");

  function getir() {
    setHata("");
    api.get("/reports/daily", { params: { date: tarih } })
      .then((cevap) => setRapor(cevap.data))
      .catch((err) => setHata(hataMesaji(err)));
  }

  useEffect(() => { getir(); }, []);

  return (
    <div>
      <h1>Gün Sonu Raporu</h1>

      {hata && <div className="hata">{hata}</div>}

      <div className="filtre-cubugu">
        <div>
          <label>Tarih</label>
          <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
        </div>
        <button onClick={getir}>Getir</button>
        <button className="ikincil" onClick={() => window.print()}>Yazdır</button>
      </div>

      {rapor && (
        <div>
          <h2 style={{ fontSize: 16 }}>{tarihFormat(rapor.date)} tarihli rapor</h2>

          <div className="ozet-kartlar">
            <div className="ozet-kart">
              <div className="baslik">Sipariş Adedi</div>
              <div className="deger">{rapor.order_count}</div>
            </div>
            <div className="ozet-kart">
              <div className="baslik">Toplam Ciro</div>
              <div className="deger">{paraFormat(rapor.total_amount)}</div>
            </div>
            <div className="ozet-kart">
              <div className="baslik">Teslim Edilen</div>
              <div className="deger">{rapor.delivered_count}</div>
            </div>
            <div className="ozet-kart">
              <div className="baslik">Kasa Toplamı</div>
              <div className="deger">{paraFormat(rapor.collected.toplam)}</div>
            </div>
          </div>

          <div className="kart">
            <h2>Tahsilat Dağılımı</h2>
            <table>
              <tbody>
                <tr><td>Nakit</td><td>{paraFormat(rapor.collected.nakit)}</td></tr>
                <tr><td>Kart</td><td>{paraFormat(rapor.collected.kart)}</td></tr>
                <tr><td>Havale</td><td>{paraFormat(rapor.collected.havale)}</td></tr>
              </tbody>
              <tfoot>
                <tr><th>Toplam</th><th>{paraFormat(rapor.collected.toplam)}</th></tr>
              </tfoot>
            </table>
          </div>

          <div className="kart">
            <h2>Günün Siparişleri</h2>
            <table>
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Müşteri</th>
                  <th>Tutar</th>
                  <th>Ödenen</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {rapor.orders.map((s) => (
                  <tr key={s.order_no}>
                    <td>{s.order_no}</td>
                    <td>{s.customer_name}</td>
                    <td>{paraFormat(s.total_amount)}</td>
                    <td>{paraFormat(s.paid_amount)}</td>
                    <td><DurumRozeti durum={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rapor.orders.length === 0 && <div className="bos-liste">Bu tarihte sipariş yok.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
