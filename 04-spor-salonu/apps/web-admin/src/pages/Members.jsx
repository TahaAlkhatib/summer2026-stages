import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { kalanGun, tarihFormat } from "../ortak";

const BOS_UYE = {
  full_name: "", phone: "", email: "", birth_date: "",
  gender: "kadin", rfid_card: "", notes: "",
};

function Members() {
  const [liste, setListe] = useState([]);
  const [arama, setArama] = useState("");
  const [form, setForm] = useState(null);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const navigate = useNavigate();

  function yukle() {
    api.get("/members", { params: { q: arama } })
      .then((c) => setListe(c.data)).catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { yukle(); }, [arama]);

  async function kaydet() {
    setHata("");
    setBasarili("");
    try {
      if (form.id) {
        await api.put("/members/" + form.id, form);
        setBasarili("Üye bilgileri güncellendi.");
      } else {
        const cevap = await api.post("/members", form);
        setBasarili("Üye kaydedildi. QR kodu: " + cevap.data.qr_code);
      }
      setForm(null);
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Üyeler</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="filtreler">
        <div style={{ flex: 3 }}>
          <label>Ara</label>
          <input placeholder="Ad, telefon veya QR kodu"
                 value={arama} onChange={(e) => setArama(e.target.value)} />
        </div>
        <button onClick={() => setForm({ ...BOS_UYE })}>+ Yeni Üye</button>
      </div>

      {form && (
        <div className="kart">
          <h2>{form.id ? "Üye Bilgilerini Düzenle" : "Yeni Üye Kaydı"}</h2>
          <div className="satir">
            <div>
              <label>Ad Soyad *</label>
              <input value={form.full_name}
                     onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <label>Telefon *</label>
              <input value={form.phone} placeholder="+90 5xx xxx xx xx"
                     onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label>E-posta</label>
              <input value={form.email || ""}
                     onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="satir">
            <div>
              <label>Doğum Tarihi</label>
              <input type="date" value={form.birth_date ? String(form.birth_date).slice(0, 10) : ""}
                     onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
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
              <label>RFID Kart No</label>
              <input value={form.rfid_card || ""} placeholder="Örn: 1009"
                     onChange={(e) => setForm({ ...form, rfid_card: e.target.value })} />
            </div>
          </div>
          <label>Notlar</label>
          <textarea rows="2" value={form.notes || ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <p style={{ color: "#8b9bab", fontSize: 13 }}>
            QR kodu kayıt sırasında otomatik üretilir.
          </p>
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
              <th>Ad Soyad</th><th>Telefon</th><th>QR Kodu</th><th>RFID</th>
              <th>Üyelik</th><th>Bitiş</th><th>Kalan Seans</th><th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {liste.map((u) => {
              const gun = kalanGun(u.end_date);
              return (
                <tr key={u.id}>
                  <td className="tiklanabilir" style={{ cursor: "pointer", color: "#ffb703" }}
                      onClick={() => navigate("/uyeler/" + u.id)}>
                    {u.full_name}
                  </td>
                  <td>{u.phone}</td>
                  <td style={{ fontFamily: "monospace" }}>{u.qr_code}</td>
                  <td>{u.rfid_card || "-"}</td>
                  <td>
                    <span className={"rozet " + (u.active_membership > 0 ? "aktif" : "bitti")}>
                      {u.active_membership > 0 ? "Aktif" : "Yok"}
                    </span>
                  </td>
                  <td>
                    {tarihFormat(u.end_date)}
                    {gun !== null && gun >= 0 && gun <= 7 && (
                      <span className="rozet uyari" style={{ marginLeft: 6 }}>{gun} gün</span>
                    )}
                  </td>
                  <td>{u.remaining_sessions === null ? "Sınırsız" : u.remaining_sessions}</td>
                  <td>
                    <button className="ikincil kucuk" onClick={() => setForm(u)}>Düzenle</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {liste.length === 0 && <div className="bos">Kayıt bulunamadı.</div>}
      </div>
    </div>
  );
}

export default Members;
