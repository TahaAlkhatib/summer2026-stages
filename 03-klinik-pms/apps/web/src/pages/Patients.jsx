import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { CINSIYET_ETIKETLERI, yasHesapla } from "../ortak";

const BOS_HASTA = {
  nationalId: "", fullName: "", phone: "", birthDate: "",
  gender: "kadin", bloodType: "", allergies: "", address: "",
};

function Patients() {
  const [liste, setListe] = useState([]);
  const [arama, setArama] = useState("");
  const [form, setForm] = useState(null);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const navigate = useNavigate();

  function yukle() {
    api.get("/patients", { params: { q: arama } })
      .then((c) => setListe(c.data))
      .catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { yukle(); }, [arama]);

  async function kaydet() {
    setHata("");
    setBasarili("");
    try {
      if (form.id) {
        await api.put("/patients/" + form.id, form);
        setBasarili("Hasta bilgileri güncellendi.");
      } else {
        await api.post("/patients", form);
        setBasarili("Hasta kaydedildi.");
      }
      setForm(null);
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Hastalar</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="filtreler">
        <div style={{ flex: 3 }}>
          <label>Ara</label>
          <input placeholder="Ad, telefon veya TC kimlik no"
                 value={arama} onChange={(e) => setArama(e.target.value)} />
        </div>
        <button onClick={() => setForm({ ...BOS_HASTA })}>+ Yeni Hasta</button>
      </div>

      {form && (
        <div className="kart">
          <h2>{form.id ? "Hasta Bilgilerini Düzenle" : "Yeni Hasta Kaydı"}</h2>
          <div className="satir">
            <div>
              <label>TC Kimlik No *</label>
              <input maxLength="11" value={form.nationalId} disabled={!!form.id}
                     onChange={(e) => setForm({ ...form, nationalId: e.target.value })} />
            </div>
            <div>
              <label>Ad Soyad *</label>
              <input value={form.fullName}
                     onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label>Telefon *</label>
              <input value={form.phone} placeholder="+90 5xx xxx xx xx"
                     onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="satir">
            <div>
              <label>Doğum Tarihi</label>
              <input type="date" value={form.birthDate || ""}
                     onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <div>
              <label>Cinsiyet</label>
              <select value={form.gender || "kadin"}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="kadin">Kadın</option>
                <option value="erkek">Erkek</option>
              </select>
            </div>
            <div>
              <label>Kan Grubu</label>
              <select value={form.bloodType || ""}
                      onChange={(e) => setForm({ ...form, bloodType: e.target.value })}>
                <option value="">Bilinmiyor</option>
                {["A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-"].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
          <label>Bilinen Alerjiler</label>
          <input value={form.allergies || ""} placeholder="Örn: Penisilin, polen"
                 onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
          <label>Adres</label>
          <textarea rows="2" value={form.address || ""}
                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button onClick={kaydet}>Kaydet</button>
          <button className="ikincil" style={{ marginLeft: 8 }} onClick={() => setForm(null)}>
            Vazgeç
          </button>
        </div>
      )}

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th><th>TC Kimlik No</th><th>Telefon</th>
              <th>Yaş</th><th>Cinsiyet</th><th>Kan Grubu</th><th>Alerji</th><th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((h) => (
              <tr key={h.id}>
                <td className="tiklanabilir" style={{ cursor: "pointer", color: "#0f766e" }}
                    onClick={() => navigate("/hastalar/" + h.id)}>
                  {h.fullName}
                </td>
                <td>{h.nationalId}</td>
                <td>{h.phone}</td>
                <td>{yasHesapla(h.birthDate)}</td>
                <td>{CINSIYET_ETIKETLERI[h.gender] || "-"}</td>
                <td>{h.bloodType || "-"}</td>
                <td>{h.allergies ? <span className="alerji">{h.allergies}</span> : "-"}</td>
                <td>
                  <button className="ikincil kucuk" onClick={() => setForm(h)}>Düzenle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {liste.length === 0 && <div className="bos">Kayıt bulunamadı.</div>}
      </div>
    </div>
  );
}

export default Patients;
