import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { kalanGun, paraFormat, tarihFormat } from "../ortak";

function Dashboard() {
  const [ozet, setOzet] = useState(null);
  const [hata, setHata] = useState("");
  const navigate = useNavigate();

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
          <div className="baslik">Aktif Üye</div>
          <div className="deger">{ozet.member_count}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Geçerli Üyelik</div>
          <div className="deger">{ozet.active_membership_count}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Bugünkü Giriş</div>
          <div className="deger">{ozet.today_entries}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Bugün Reddedilen</div>
          <div className="deger" style={{ color: "#f87171" }}>{ozet.today_rejects}</div>
        </div>
      </div>

      <div className="kutular">
        <div className="kutu">
          <div className="baslik">Bu Ay Üyelik Geliri</div>
          <div className="deger">{paraFormat(ozet.month_membership_revenue)}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Bu Ay Büfe Geliri</div>
          <div className="deger">{paraFormat(ozet.month_shop_revenue)}</div>
        </div>
        <div className="kutu">
          <div className="baslik">Tahsil Edilmemiş</div>
          <div className="deger" style={{ color: "#f87171" }}>{paraFormat(ozet.unpaid_total)}</div>
        </div>
      </div>

      <div className="kart">
        <h2>Yakında Bitecek Üyelikler (7 gün)</h2>
        {ozet.expiring_soon.length === 0 ? (
          <div className="bos">Yakında bitecek üyelik yok.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Üye</th><th>Telefon</th><th>Paket</th><th>Bitiş</th><th>Kalan</th></tr>
            </thead>
            <tbody>
              {ozet.expiring_soon.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.phone}</td>
                  <td>{u.package_name}</td>
                  <td>{tarihFormat(u.end_date)}</td>
                  <td>
                    <span className="rozet uyari">{kalanGun(u.end_date)} gün</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="kart">
        <h2>En Çok Satan Paketler</h2>
        <table>
          <thead>
            <tr><th>Paket</th><th>Satış Adedi</th><th>Ciro</th></tr>
          </thead>
          <tbody>
            {ozet.top_packages.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.count}</td>
                <td>{paraFormat(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
