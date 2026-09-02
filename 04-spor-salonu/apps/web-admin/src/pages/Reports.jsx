import { useEffect, useState } from "react";
import api, { hataMesaji } from "../api";
import { paraFormat, tarihFormat, yerelTarih } from "../ortak";

function Reports() {
  const [tarih, setTarih] = useState(yerelTarih());
  const [rapor, setRapor] = useState(null);
  const [hata, setHata] = useState("");

  function getir() {
    setHata("");
    api.get("/reports/daily", { params: { date: tarih } })
      .then((c) => setRapor(c.data)).catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { getir(); }, []);

  return (
    <div>
      <h1>Gün Sonu Raporu</h1>

      {hata && <div className="hata">{hata}</div>}

      <div className="filtreler">
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

          <div className="kutular">
            <div className="kutu">
              <div className="baslik">Üyelik Tahsilatı</div>
              <div className="deger">{paraFormat(rapor.membership_collected.toplam)}</div>
            </div>
            <div className="kutu">
              <div className="baslik">Büfe Satışı</div>
              <div className="deger">{paraFormat(rapor.shop_collected.toplam)}</div>
            </div>
            <div className="kutu">
              <div className="baslik">Genel Toplam</div>
              <div className="deger">{paraFormat(rapor.grand_total)}</div>
            </div>
            <div className="kutu">
              <div className="baslik">Giriş / Ret</div>
              <div className="deger">
                {rapor.entries.izin || 0}
                <span style={{ color: "#f87171", fontSize: 18 }}> / {rapor.entries.red || 0}</span>
              </div>
            </div>
          </div>

          <div className="satir">
            <div className="kart">
              <h2>Üyelik Tahsilatı Dağılımı</h2>
              <table>
                <tbody>
                  <tr><td>Nakit</td><td>{paraFormat(rapor.membership_collected.nakit)}</td></tr>
                  <tr><td>Kart</td><td>{paraFormat(rapor.membership_collected.kart)}</td></tr>
                  <tr><td>Havale</td><td>{paraFormat(rapor.membership_collected.havale)}</td></tr>
                </tbody>
                <tfoot>
                  <tr><th>Toplam</th><th>{paraFormat(rapor.membership_collected.toplam)}</th></tr>
                </tfoot>
              </table>
            </div>

            <div className="kart">
              <h2>Büfe Satışı Dağılımı</h2>
              <table>
                <tbody>
                  <tr><td>Nakit</td><td>{paraFormat(rapor.shop_collected.nakit)}</td></tr>
                  <tr><td>Kart</td><td>{paraFormat(rapor.shop_collected.kart)}</td></tr>
                </tbody>
                <tfoot>
                  <tr><th>Toplam</th><th>{paraFormat(rapor.shop_collected.toplam)}</th></tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="kart">
            <h2>Bugün Satılan Üyelikler</h2>
            <table>
              <thead>
                <tr><th>Üye</th><th>Paket</th><th>Başlangıç</th><th>Bitiş</th><th>Ücret</th><th>Ödenen</th></tr>
              </thead>
              <tbody>
                {rapor.new_memberships.map((m) => (
                  <tr key={m.id}>
                    <td>{m.full_name}</td>
                    <td>{m.package_name}</td>
                    <td>{tarihFormat(m.start_date)}</td>
                    <td>{tarihFormat(m.end_date)}</td>
                    <td>{paraFormat(m.total_price)}</td>
                    <td>{paraFormat(m.paid_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rapor.new_memberships.length === 0 && (
              <div className="bos">Bu tarihte üyelik satılmadı.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
