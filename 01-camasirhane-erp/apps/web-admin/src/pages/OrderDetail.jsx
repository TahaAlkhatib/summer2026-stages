import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { DURUM_ETIKETLERI, DurumRozeti, paraFormat, tarihFormat, tarihSaatFormat } from "../durumlar";

function OrderDetail() {
  const { id } = useParams();
  const [siparis, setSiparis] = useState(null);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  const [yeniDurum, setYeniDurum] = useState("");
  const [odemeTutar, setOdemeTutar] = useState("");
  const [odemeYontem, setOdemeYontem] = useState("nakit");

  function yukle() {
    api.get("/orders/" + id)
      .then((cevap) => {
        setSiparis(cevap.data);
        setYeniDurum(cevap.data.status);
      })
      .catch((err) => setHata(hataMesaji(err)));
  }

  useEffect(() => { yukle(); }, [id]);

  async function durumGuncelle() {
    setHata("");
    setBasarili("");
    try {
      await api.put("/orders/" + id + "/status", { status: yeniDurum });
      setBasarili("Sipariş aşaması güncellendi.");
      yukle();
    } catch (err) {
      setHata(hataMesaji(err));
    }
  }

  async function odemeAl() {
    setHata("");
    setBasarili("");
    try {
      await api.post("/payments", {
        order_id: Number(id),
        amount: Number(odemeTutar),
        method: odemeYontem,
      });
      setBasarili("Ödeme alındı.");
      setOdemeTutar("");
      yukle();
    } catch (err) {
      setHata(hataMesaji(err));
    }
  }

  if (!siparis) return <div>{hata ? <div className="hata">{hata}</div> : "Yükleniyor..."}</div>;

  const kalan = Number(siparis.total_amount) - Number(siparis.paid_amount);

  return (
    <div>
      <h1>Sipariş Detayı — {siparis.order_no}</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="form-satir">
        <div className="kart">
          <h2>Sipariş Bilgileri</h2>
          <p><strong>Sipariş No:</strong> {siparis.order_no}</p>
          <p><strong>Durum:</strong> <DurumRozeti durum={siparis.status} /></p>
          <p><strong>Oluşturan:</strong> {siparis.created_by_name}</p>
          <p><strong>Oluşturma:</strong> {tarihSaatFormat(siparis.created_at)}</p>
          <p><strong>Söz Verilen Teslim:</strong> {tarihFormat(siparis.promised_date)}</p>
          <p><strong>Teslim Tipi:</strong> {siparis.delivery_type === "kurye" ? "Kurye ile" : "Mağazadan"}</p>
          {siparis.notes && <p><strong>Not:</strong> {siparis.notes}</p>}
        </div>

        <div className="kart">
          <h2>Müşteri</h2>
          <p><strong>Ad Soyad:</strong> {siparis.customer.full_name}</p>
          <p><strong>Telefon:</strong> {siparis.customer.phone}</p>
          <p><strong>Adres:</strong> {siparis.customer.address || "-"}</p>
          <p><strong>İlçe:</strong> {siparis.customer.district || "-"}</p>
        </div>
      </div>

      <div className="kart">
        <h2>Kalemler</h2>
        <table>
          <thead>
            <tr>
              <th>Barkod</th>
              <th>Hizmet</th>
              <th>Miktar</th>
              <th>Birim Fiyat</th>
              <th>Tutar</th>
            </tr>
          </thead>
          <tbody>
            {siparis.items.map((k) => (
              <tr key={k.id}>
                <td><code>{k.barcode}</code></td>
                <td>{k.item_name}</td>
                <td>{Number(k.quantity)}</td>
                <td>{paraFormat(k.unit_price)}</td>
                <td>{paraFormat(k.line_total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan="4">Toplam</th>
              <th>{paraFormat(siparis.total_amount)}</th>
            </tr>
            <tr>
              <th colSpan="4">Ödenen</th>
              <th>{paraFormat(siparis.paid_amount)}</th>
            </tr>
            <tr>
              <th colSpan="4">Kalan</th>
              <th style={{ color: kalan > 0 ? "#dc3545" : "#198754" }}>{paraFormat(kalan)}</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="form-satir">
        <div className="kart">
          <h2>Aşamayı Güncelle</h2>
          <label>Yeni Aşama</label>
          <select value={yeniDurum} onChange={(e) => setYeniDurum(e.target.value)}>
            {Object.keys(DURUM_ETIKETLERI).map((d) => (
              <option key={d} value={d}>{DURUM_ETIKETLERI[d]}</option>
            ))}
          </select>
          <button onClick={durumGuncelle}>Kaydet</button>
        </div>

        <div className="kart">
          <h2>Ödeme Al</h2>
          {kalan <= 0 ? (
            <p style={{ color: "#198754", margin: 0 }}>Bu siparişin ödemesi tamamlandı.</p>
          ) : (
            <>
              <label>Tutar (₺)</label>
              <input
                type="number"
                value={odemeTutar}
                onChange={(e) => setOdemeTutar(e.target.value)}
                placeholder={kalan.toFixed(2)}
              />
              <label>Yöntem</label>
              <select value={odemeYontem} onChange={(e) => setOdemeYontem(e.target.value)}>
                <option value="nakit">Nakit</option>
                <option value="kart">Kart</option>
                <option value="havale">Havale</option>
              </select>
              <button onClick={odemeAl} disabled={!odemeTutar}>Tahsil Et</button>
            </>
          )}
        </div>
      </div>

      <div className="kart">
        <h2>Durum Geçmişi</h2>
        <table>
          <thead>
            <tr>
              <th>Aşama</th>
              <th>Değiştiren</th>
              <th>Tarih</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {siparis.history.map((g) => (
              <tr key={g.id}>
                <td><DurumRozeti durum={g.status} /></td>
                <td>{g.changed_by_name || "-"}</td>
                <td>{tarihSaatFormat(g.changed_at)}</td>
                <td>{g.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderDetail;
