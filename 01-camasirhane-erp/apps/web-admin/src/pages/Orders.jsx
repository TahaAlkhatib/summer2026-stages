import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { DURUM_ETIKETLERI, DurumRozeti, paraFormat, tarihFormat } from "../durumlar";

function Orders() {
  const [siparisler, setSiparisler] = useState([]);
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("");
  const [tarih, setTarih] = useState("");
  const [hata, setHata] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setHata("");
    api.get("/orders", { params: { q: arama, status: durum, date: tarih } })
      .then((cevap) => setSiparisler(cevap.data))
      .catch((err) => setHata(hataMesaji(err)));
  }, [arama, durum, tarih]);

  return (
    <div>
      <h1>Siparişler</h1>

      <div className="filtre-cubugu">
        <div style={{ flex: 2 }}>
          <label>Ara</label>
          <input
            placeholder="Sipariş no veya müşteri ara"
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
        <div style={{ flex: 1 }}>
          <label>Tarih</label>
          <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
        </div>
        <button className="ikincil" onClick={() => { setArama(""); setDurum(""); setTarih(""); }}>
          Temizle
        </button>
      </div>

      {hata && <div className="hata">{hata}</div>}

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Sipariş No</th>
              <th>Müşteri</th>
              <th>Telefon</th>
              <th>Adet</th>
              <th>Tutar</th>
              <th>Ödenen</th>
              <th>Durum</th>
              <th>Teslim</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {siparisler.map((s) => (
              <tr
                key={s.id}
                className="tiklanabilir"
                onClick={() => navigate("/siparisler/" + s.id)}
              >
                <td><strong>{s.order_no}</strong></td>
                <td>{s.customer_name}</td>
                <td>{s.customer_phone}</td>
                <td>{s.item_count}</td>
                <td>{paraFormat(s.total_amount)}</td>
                <td>{paraFormat(s.paid_amount)}</td>
                <td><DurumRozeti durum={s.status} /></td>
                <td>{s.delivery_type === "kurye" ? "Kurye" : "Mağazadan"}</td>
                <td>{tarihFormat(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {siparisler.length === 0 && <div className="bos-liste">Kayıt bulunamadı.</div>}
      </div>
    </div>
  );
}

export default Orders;
