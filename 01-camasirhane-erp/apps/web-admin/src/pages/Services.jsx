import { useEffect, useState } from "react";
import api, { getUser, hataMesaji } from "../api";
import { paraFormat } from "../durumlar";

const KATEGORI_ETIKETLERI = {
  yikama: "Yıkama",
  kuru_temizleme: "Kuru Temizleme",
  utu: "Ütü",
  leke: "Leke Çıkarma",
};

const BIRIM_ETIKETLERI = { adet: "Adet", kg: "Kg", m2: "m²" };

const BOS_HIZMET = { name: "", category: "yikama", unit: "adet", price: "", is_active: true };

function Services() {
  const [hizmetler, setHizmetler] = useState([]);
  const [form, setForm] = useState(null);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  const kullanici = getUser();
  const yonetici = kullanici.role === "admin";

  function yukle() {
    api.get("/services")
      .then((cevap) => setHizmetler(cevap.data))
      .catch((err) => setHata(hataMesaji(err)));
  }

  useEffect(() => { yukle(); }, []);

  async function kaydet() {
    setHata("");
    setBasarili("");
    try {
      if (form.id) {
        await api.put("/services/" + form.id, form);
        setBasarili("Hizmet güncellendi.");
      } else {
        await api.post("/services", form);
        setBasarili("Hizmet eklendi.");
      }
      setForm(null);
      yukle();
    } catch (err) {
      setHata(hataMesaji(err));
    }
  }

  return (
    <div>
      <h1>Hizmetler ve Fiyatlar</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      {yonetici && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setForm({ ...BOS_HIZMET })}>+ Yeni Hizmet</button>
        </div>
      )}

      {form && (
        <div className="kart">
          <h2>{form.id ? "Hizmeti Düzenle" : "Yeni Hizmet"}</h2>
          <label>Hizmet Adı *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div className="form-satir">
            <div>
              <label>Kategori *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.keys(KATEGORI_ETIKETLERI).map((k) => (
                  <option key={k} value={k}>{KATEGORI_ETIKETLERI[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Birim *</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {Object.keys(BIRIM_ETIKETLERI).map((b) => (
                  <option key={b} value={b}>{BIRIM_ETIKETLERI[b]}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Fiyat (₺) *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>

          <label style={{ fontWeight: 400 }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              style={{ width: "auto", marginRight: 6, marginBottom: 0 }}
            />
            Aktif
          </label>

          <div style={{ marginTop: 14 }}>
            <button onClick={kaydet}>Kaydet</button>
            <button className="ikincil" style={{ marginLeft: 8 }} onClick={() => setForm(null)}>Vazgeç</button>
          </div>
        </div>
      )}

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Hizmet Adı</th>
              <th>Kategori</th>
              <th>Birim</th>
              <th>Fiyat</th>
              <th>Durum</th>
              {yonetici && <th>İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {hizmetler.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{KATEGORI_ETIKETLERI[h.category]}</td>
                <td>{BIRIM_ETIKETLERI[h.unit]}</td>
                <td>{paraFormat(h.price)}</td>
                <td>{h.is_active ? "Aktif" : "Pasif"}</td>
                {yonetici && (
                  <td>
                    <button className="ikincil kucuk" onClick={() => setForm(h)}>Düzenle</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Services;
