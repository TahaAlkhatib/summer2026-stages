import { useEffect, useState } from "react";
import api, { hataMesaji } from "../api";
import { GUNLER, yerelTarih } from "../ortak";

function Classes() {
  const [dersler, setDersler] = useState([]);
  const [secilenDers, setSecilenDers] = useState(null);
  const [tarih, setTarih] = useState(yerelTarih());
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [uyeArama, setUyeArama] = useState("");
  const [uyeler, setUyeler] = useState([]);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  useEffect(() => {
    api.get("/classes").then((c) => setDersler(c.data)).catch((e) => setHata(hataMesaji(e)));
  }, []);

  useEffect(() => {
    if (!secilenDers) return;
    api.get("/classes/" + secilenDers.id + "/bookings", { params: { date: tarih } })
      .then((c) => setRezervasyonlar(c.data)).catch(() => setRezervasyonlar([]));
  }, [secilenDers, tarih]);

  useEffect(() => {
    if (uyeArama.length < 2) { setUyeler([]); return; }
    api.get("/members", { params: { q: uyeArama } })
      .then((c) => setUyeler(c.data)).catch(() => setUyeler([]));
  }, [uyeArama]);

  async function rezerveEt(uyeId) {
    setHata("");
    setBasarili("");
    try {
      const cevap = await api.post("/classes/" + secilenDers.id + "/bookings", {
        member_id: uyeId,
        booking_date: tarih,
      });
      setBasarili("Rezervasyon yapıldı. Kalan kontenjan: " + cevap.data.remaining_capacity);
      setUyeArama("");
      const yeni = await api.get("/classes/" + secilenDers.id + "/bookings", { params: { date: tarih } });
      setRezervasyonlar(yeni.data);
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  async function iptalEt(rezervasyonId) {
    setHata("");
    try {
      await api.delete("/classes/bookings/" + rezervasyonId);
      setBasarili("Rezervasyon iptal edildi.");
      const yeni = await api.get("/classes/" + secilenDers.id + "/bookings", { params: { date: tarih } });
      setRezervasyonlar(yeni.data);
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Grup Dersleri</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="kart">
        <h2>Haftalık Program</h2>
        <table>
          <thead>
            <tr><th>Ders</th><th>Gün</th><th>Saat</th><th>Antrenör</th><th>Kontenjan</th><th>İşlem</th></tr>
          </thead>
          <tbody>
            {dersler.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.weekday_name}</td>
                <td>{d.start_time}</td>
                <td>{d.trainer_name || "-"}</td>
                <td>{d.capacity} kişi</td>
                <td>
                  <button className="ikincil kucuk" onClick={() => setSecilenDers(d)}>
                    Rezervasyonlar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {secilenDers && (
        <div className="kart">
          <h2>{secilenDers.name} — {secilenDers.weekday_name} {secilenDers.start_time}</h2>

          <div className="filtreler">
            <div>
              <label>Tarih</label>
              <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
            </div>
            <div style={{ flex: 2 }}>
              <label>Üye Ekle</label>
              <input value={uyeArama} onChange={(e) => setUyeArama(e.target.value)}
                     placeholder="Üye adı ara (en az 2 harf)" />
            </div>
            <button className="ikincil" onClick={() => setSecilenDers(null)}>Kapat</button>
          </div>

          {uyeler.length > 0 && (
            <table style={{ marginBottom: 20 }}>
              <tbody>
                {uyeler.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.phone}</td>
                    <td>
                      <button className="kucuk" onClick={() => rezerveEt(u.id)}>Rezerve Et</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p style={{ color: "#8b9bab" }}>
            {rezervasyonlar.length} / {secilenDers.capacity} kontenjan dolu
          </p>

          <table>
            <thead>
              <tr><th>Üye</th><th>Telefon</th><th>Durum</th><th>İşlem</th></tr>
            </thead>
            <tbody>
              {rezervasyonlar.map((r) => (
                <tr key={r.id}>
                  <td>{r.member_name}</td>
                  <td>{r.phone}</td>
                  <td><span className="rozet aktif">Rezerve</span></td>
                  <td>
                    <button className="kirmizi kucuk" onClick={() => iptalEt(r.id)}>İptal</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rezervasyonlar.length === 0 && <div className="bos">Bu tarihte rezervasyon yok.</div>}
        </div>
      )}
    </div>
  );
}

export default Classes;
