import { useEffect, useState } from "react";
import api, { hataMesaji } from "../api";

const BOS_MUSTERI = { full_name: "", phone: "", address: "", district: "", notes: "" };

function Customers() {
  const [musteriler, setMusteriler] = useState([]);
  const [arama, setArama] = useState("");
  const [form, setForm] = useState(null);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  function yukle() {
    api.get("/customers", { params: { q: arama } })
      .then((cevap) => setMusteriler(cevap.data))
      .catch((err) => setHata(hataMesaji(err)));
  }

  useEffect(() => { yukle(); }, [arama]);

  async function kaydet() {
    setHata("");
    setBasarili("");
    try {
      if (form.id) {
        await api.put("/customers/" + form.id, form);
        setBasarili("Müşteri güncellendi.");
      } else {
        await api.post("/customers", form);
        setBasarili("Müşteri eklendi.");
      }
      setForm(null);
      yukle();
    } catch (err) {
      setHata(hataMesaji(err));
    }
  }

  return (
    <div>
      <h1>Müşteriler</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="filtre-cubugu">
        <div style={{ flex: 3 }}>
          <label>Ara</label>
          <input
            placeholder="Ad, telefon veya ilçe"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
          />
        </div>
        <button onClick={() => setForm({ ...BOS_MUSTERI })}>+ Yeni Müşteri</button>
      </div>

      {form && (
        <div className="kart">
          <h2>{form.id ? "Müşteriyi Düzenle" : "Yeni Müşteri"}</h2>
          <div className="form-satir">
            <div>
              <label>Ad Soyad *</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label>Telefon *</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90 5xx xxx xx xx" />
            </div>
          </div>
          <div className="form-satir">
            <div>
              <label>Adres</label>
              <input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label>İlçe</label>
              <input value={form.district || ""} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
          </div>
          <label>Notlar</label>
          <textarea rows="2" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button onClick={kaydet}>Kaydet</button>
          <button className="ikincil" style={{ marginLeft: 8 }} onClick={() => setForm(null)}>Vazgeç</button>
        </div>
      )}

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Telefon</th>
              <th>İlçe</th>
              <th>Adres</th>
              <th>Sipariş Sayısı</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {musteriler.map((m) => (
              <tr key={m.id}>
                <td>{m.full_name}</td>
                <td>{m.phone}</td>
                <td>{m.district || "-"}</td>
                <td>{m.address || "-"}</td>
                <td>{m.order_count}</td>
                <td>
                  <button className="ikincil kucuk" onClick={() => setForm(m)}>Düzenle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {musteriler.length === 0 && <div className="bos-liste">Kayıt bulunamadı.</div>}
      </div>
    </div>
  );
}

export default Customers;
