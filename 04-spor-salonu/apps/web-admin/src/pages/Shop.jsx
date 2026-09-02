import { useEffect, useState } from "react";
import api, { hataMesaji } from "../api";
import { paraFormat, tarihSaatFormat, yerelTarih } from "../ortak";

// Büfe / kasa satış ekranı
function Shop() {
  const [urunler, setUrunler] = useState([]);
  const [sepet, setSepet] = useState([]);
  const [uyeArama, setUyeArama] = useState("");
  const [uyeler, setUyeler] = useState([]);
  const [secilenUye, setSecilenUye] = useState(null);
  const [yontem, setYontem] = useState("nakit");
  const [satislar, setSatislar] = useState([]);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  function yukle() {
    api.get("/pos/products", { params: { active: 1 } })
      .then((c) => setUrunler(c.data)).catch((e) => setHata(hataMesaji(e)));
    api.get("/pos/sales", { params: { date: yerelTarih() } })
      .then((c) => setSatislar(c.data)).catch(() => {});
  }

  useEffect(() => { yukle(); }, []);

  useEffect(() => {
    if (uyeArama.length < 2) { setUyeler([]); return; }
    api.get("/members", { params: { q: uyeArama } })
      .then((c) => setUyeler(c.data)).catch(() => setUyeler([]));
  }, [uyeArama]);

  function sepeteEkle(urun) {
    const mevcut = sepet.find((s) => s.product_id === urun.id);
    if (mevcut) {
      setSepet(sepet.map((s) =>
        s.product_id === urun.id ? { ...s, quantity: s.quantity + 1 } : s
      ));
    } else {
      setSepet([...sepet, {
        product_id: urun.id, name: urun.name,
        price: Number(urun.price), quantity: 1,
      }]);
    }
  }

  function sepettenCikar(urunId) {
    setSepet(sepet.filter((s) => s.product_id !== urunId));
  }

  let toplam = 0;
  sepet.forEach((s) => (toplam += s.price * s.quantity));

  async function satisiTamamla() {
    setHata("");
    setBasarili("");
    try {
      const cevap = await api.post("/pos/sales", {
        member_id: secilenUye ? secilenUye.id : null,
        method: yontem,
        items: sepet.map((s) => ({ product_id: s.product_id, quantity: s.quantity })),
      });
      setBasarili("Satış tamamlandı: " + cevap.data.sale_no +
                  " — " + paraFormat(cevap.data.total_amount));
      setSepet([]);
      setSecilenUye(null);
      setUyeArama("");
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  return (
    <div>
      <h1>Büfe / Kasa</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="satir">
        <div className="kart" style={{ flex: 2 }}>
          <h2>Ürünler</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 10,
          }}>
            {urunler.map((u) => (
              <div
                key={u.id}
                onClick={() => u.stock_quantity > 0 && sepeteEkle(u)}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  border: "1px solid #2d3f4f",
                  background: u.stock_quantity > 0 ? "#1d2a36" : "#161b22",
                  cursor: u.stock_quantity > 0 ? "pointer" : "not-allowed",
                  opacity: u.stock_quantity > 0 ? 1 : 0.5,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{u.name}</div>
                <div style={{ color: "#ffb703", fontWeight: 700 }}>{paraFormat(u.price)}</div>
                <div style={{ color: "#8b9bab", fontSize: 12, marginTop: 4 }}>
                  Stok: {u.stock_quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kart">
          <h2>Sepet</h2>
          {sepet.length === 0 ? (
            <div className="bos">Sepet boş. Ürünlere tıklayarak ekleyin.</div>
          ) : (
            <table>
              <tbody>
                {sepet.map((s) => (
                  <tr key={s.product_id}>
                    <td>{s.name}</td>
                    <td>{s.quantity} ×</td>
                    <td>{paraFormat(s.price * s.quantity)}</td>
                    <td>
                      <button className="kirmizi kucuk"
                              onClick={() => sepettenCikar(s.product_id)}>Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th>Toplam</th><th></th><th>{paraFormat(toplam)}</th><th></th></tr>
              </tfoot>
            </table>
          )}

          <div style={{ marginTop: 16 }}>
            <label>Üyeye Yaz (opsiyonel)</label>
            {secilenUye ? (
              <p>
                {secilenUye.full_name}{" "}
                <button className="ikincil kucuk" onClick={() => setSecilenUye(null)}>
                  Kaldır
                </button>
              </p>
            ) : (
              <>
                <input value={uyeArama} onChange={(e) => setUyeArama(e.target.value)}
                       placeholder="Üye ara" />
                {uyeler.length > 0 && (
                  <table>
                    <tbody>
                      {uyeler.slice(0, 5).map((u) => (
                        <tr key={u.id} className="tiklanabilir" onClick={() => setSecilenUye(u)}>
                          <td>{u.full_name}</td><td>{u.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            <label>Ödeme Yöntemi</label>
            <select value={yontem} onChange={(e) => setYontem(e.target.value)}>
              <option value="nakit">Nakit</option>
              <option value="kart">Kart</option>
            </select>

            <button onClick={satisiTamamla} disabled={sepet.length === 0} style={{ width: "100%" }}>
              Satışı Tamamla
            </button>
          </div>
        </div>
      </div>

      <div className="kart">
        <h2>Bugünkü Satışlar</h2>
        <table>
          <thead>
            <tr><th>Satış No</th><th>Üye</th><th>Tutar</th><th>Yöntem</th><th>Saat</th></tr>
          </thead>
          <tbody>
            {satislar.map((s) => (
              <tr key={s.id}>
                <td>{s.sale_no}</td>
                <td>{s.member_name || "Misafir"}</td>
                <td>{paraFormat(s.total_amount)}</td>
                <td>{s.method === "nakit" ? "Nakit" : "Kart"}</td>
                <td>{tarihSaatFormat(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {satislar.length === 0 && <div className="bos">Bugün satış yapılmadı.</div>}
      </div>
    </div>
  );
}

export default Shop;
