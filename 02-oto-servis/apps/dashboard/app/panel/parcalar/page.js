"use client";

import { useEffect, useState } from "react";
import { api, paraFormat, kullanici } from "@/lib/api";

export default function Parcalar() {
  const [liste, setListe] = useState([]);
  const [arama, setArama] = useState("");
  const [sadeceKritik, setSadeceKritik] = useState(false);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const [girisMiktar, setGirisMiktar] = useState({});

  const aktif = kullanici();
  const yonetici = aktif && aktif.role === "admin";

  function yukle() {
    const p = new URLSearchParams();
    if (arama) p.set("q", arama);
    if (sadeceKritik) p.set("lowStock", "1");
    api.get("/parts?" + p.toString()).then(setListe).catch((e) => setHata(e.message));
  }

  useEffect(() => { yukle(); }, [arama, sadeceKritik]);

  async function stokGirisi(parcaId) {
    setHata("");
    setBasarili("");
    try {
      const miktar = Number(girisMiktar[parcaId]);
      await api.post("/parts/" + parcaId + "/stock-in", { quantity: miktar });
      setBasarili("Stok girişi yapıldı.");
      setGirisMiktar({ ...girisMiktar, [parcaId]: "" });
      yukle();
    } catch (e) {
      setHata(e.message);
    }
  }

  return (
    <div>
      <h1>Yedek Parça Stoğu</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="filtreler">
        <div style={{ flex: 3 }}>
          <label>Ara</label>
          <input placeholder="Parça adı, kodu veya markası"
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
              <th>Kod</th><th>Parça</th><th>Marka</th><th>Fiyat</th>
              <th>Stok</th><th>Min.</th>
              {yonetici && <th>Stok Girişi</th>}
            </tr>
          </thead>
          <tbody>
            {liste.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{p.brand}</td>
                <td>{paraFormat(p.price)}</td>
                <td className={p.is_low ? "dusuk-stok" : ""}>
                  {p.stock_quantity} {p.unit}
                </td>
                <td>{p.min_stock}</td>
                {yonetici && (
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <input type="number" min="1" style={{ width: 80, marginBottom: 0 }}
                             value={girisMiktar[p.id] || ""}
                             onChange={(e) => setGirisMiktar({ ...girisMiktar, [p.id]: e.target.value })} />
                      <button className="kucuk" disabled={!girisMiktar[p.id]}
                              onClick={() => stokGirisi(p.id)}>Ekle</button>
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
