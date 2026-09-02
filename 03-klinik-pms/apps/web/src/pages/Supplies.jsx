import { useEffect, useState } from "react";
import api, { getUser, hataMesaji } from "../api";
import { paraFormat } from "../ortak";

function Supplies() {
  const [liste, setListe] = useState([]);
  const [arama, setArama] = useState("");
  const [sadeceKritik, setSadeceKritik] = useState(false);
  const [girisMiktar, setGirisMiktar] = useState({});
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  const kullanici = getUser();
  const yonetici = kullanici && kullanici.role === "admin";

  function yukle() {
    const p = {};
    if (arama) p.q = arama;
    if (sadeceKritik) p.lowStock = "1";
    api.get("/supplies", { params: p })
      .then((c) => setListe(c.data))
      .catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => { yukle(); }, [arama, sadeceKritik]);

  async function stokGirisi(id) {
    setHata("");
    setBasarili("");
    try {
      await api.put("/supplies/" + id + "/stock-in", { quantity: Number(girisMiktar[id]) });
      setBasarili("Stok girişi yapıldı.");
      setGirisMiktar({ ...girisMiktar, [id]: "" });
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Sarf Malzeme Stoğu</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="filtreler">
        <div style={{ flex: 3 }}>
          <label>Ara</label>
          <input placeholder="Malzeme adı veya kodu"
                 value={arama} onChange={(e) => setArama(e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 400 }}>
            <input type="checkbox" style={{ width: "auto", marginRight: 6, marginBottom: 0 }}
                   checked={sadeceKritik} onChange={(e) => setSadeceKritik(e.target.checked)} />
            Sadece kritik stok
          </label>
        </div>
      </div>

      <div className="kart">
        <table>
          <thead>
            <tr>
              <th>Kod</th><th>Malzeme</th><th>Birim Fiyat</th>
              <th>Stok</th><th>Minimum</th>
              {yonetici && <th>Stok Girişi</th>}
            </tr>
          </thead>
          <tbody>
            {liste.map((m) => (
              <tr key={m.id}>
                <td>{m.code}</td>
                <td>{m.name}</td>
                <td>{paraFormat(m.unit_price)}</td>
                <td className={m.is_low ? "dusuk-stok" : ""}>{m.stock_quantity} {m.unit}</td>
                <td>{m.min_stock}</td>
                {yonetici && (
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <input type="number" min="1" style={{ width: 80, marginBottom: 0 }}
                             value={girisMiktar[m.id] || ""}
                             onChange={(e) => setGirisMiktar({ ...girisMiktar, [m.id]: e.target.value })} />
                      <button className="kucuk" disabled={!girisMiktar[m.id]}
                              onClick={() => stokGirisi(m.id)}>Ekle</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {liste.length === 0 && <div className="bos">Kayıt bulunamadı.</div>}
      </div>
    </div>
  );
}

export default Supplies;
