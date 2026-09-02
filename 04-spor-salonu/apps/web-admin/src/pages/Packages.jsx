import { useEffect, useState } from "react";
import api, { getUser, hataMesaji } from "../api";
import { paraFormat } from "../ortak";

const BOS = { name: "", duration_days: 30, session_count: "", price: "", is_active: true };

function Packages() {
  const [liste, setListe] = useState([]);
  const [form, setForm] = useState(null);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  const kullanici = getUser();
  const yonetici = kullanici && kullanici.role === "admin";

  function yukle() {
    api.get("/packages").then((c) => setListe(c.data)).catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { yukle(); }, []);

  async function kaydet() {
    setHata("");
    setBasarili("");
    try {
      const govde = {
        ...form,
        session_count: form.session_count === "" ? null : Number(form.session_count),
      };
      if (form.id) {
        await api.put("/packages/" + form.id, govde);
        setBasarili("Paket güncellendi.");
      } else {
        await api.post("/packages", govde);
        setBasarili("Paket eklendi.");
      }
      setForm(null);
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Üyelik Paketleri</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      {yonetici && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setForm({ ...BOS })}>+ Yeni Paket</button>
        </div>
      )}

      {form && (
        <div className="kart">
          <h2>{form.id ? "Paketi Düzenle" : "Yeni Paket"}</h2>
          <label>Paket Adı *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="satir">
            <div>
              <label>Süre (gün) *</label>
              <input type="number" value={form.duration_days}
                     onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
            </div>
            <div>
              <label>Seans Sayısı (boş = sınırsız)</label>
              <input type="number" value={form.session_count ?? ""}
                     onChange={(e) => setForm({ ...form, session_count: e.target.value })} />
            </div>
            <div>
              <label>Fiyat (₺) *</label>
              <input type="number" step="0.01" value={form.price}
                     onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <label style={{ fontWeight: 400 }}>
            <input type="checkbox" style={{ width: "auto", marginRight: 6, marginBottom: 0 }}
                   checked={!!form.is_active}
                   onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Satışa açık
          </label>
          <div style={{ marginTop: 14 }}>
            <button onClick={kaydet}>Kaydet</button>
            <button className="ikincil" style={{ marginLeft: 8 }} onClick={() => setForm(null)}>
              Vazgeç
            </button>
          </div>
        </div>
      )}

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Paket</th><th>Süre</th><th>Seans</th><th>Fiyat</th>
              <th>Durum</th>{yonetici && <th>İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {liste.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.duration_days} gün</td>
                <td>{p.session_count === null ? "Sınırsız" : p.session_count + " seans"}</td>
                <td>{paraFormat(p.price)}</td>
                <td>
                  <span className={"rozet " + (p.is_active ? "aktif" : "bitti")}>
                    {p.is_active ? "Açık" : "Kapalı"}
                  </span>
                </td>
                {yonetici && (
                  <td><button className="ikincil kucuk" onClick={() => setForm(p)}>Düzenle</button></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Packages;
