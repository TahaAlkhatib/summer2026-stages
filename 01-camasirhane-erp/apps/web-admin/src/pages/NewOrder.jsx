import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { paraFormat, yerelTarih } from "../durumlar";

function NewOrder() {
  const [musteriler, setMusteriler] = useState([]);
  const [musteriArama, setMusteriArama] = useState("");
  const [secilenMusteri, setSecilenMusteri] = useState(null);

  const [hizmetler, setHizmetler] = useState([]);
  const [secilenHizmet, setSecilenHizmet] = useState("");
  const [miktar, setMiktar] = useState("1");
  const [kalemler, setKalemler] = useState([]);

  const [teslimTipi, setTeslimTipi] = useState("magaza");
  const [sozVerilen, setSozVerilen] = useState("");
  const [not, setNot] = useState("");

  const [yeniMusteriFormu, setYeniMusteriFormu] = useState(false);
  const [yeniMusteri, setYeniMusteri] = useState({ full_name: "", phone: "", address: "", district: "" });

  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/services", { params: { active: 1 } })
      .then((cevap) => setHizmetler(cevap.data))
      .catch((err) => setHata(hataMesaji(err)));

    // Söz verilen tarih varsayılan olarak 2 gün sonrası
    setSozVerilen(yerelTarih(2));
  }, []);

  useEffect(() => {
    if (musteriArama.length < 2) {
      setMusteriler([]);
      return;
    }
    api.get("/customers", { params: { q: musteriArama } })
      .then((cevap) => setMusteriler(cevap.data))
      .catch(() => setMusteriler([]));
  }, [musteriArama]);

  function kalemEkle() {
    // MongoDB kimlikleri metin olduğu için sayıya çevirmiyoruz
    const hizmet = hizmetler.find((h) => h.id === secilenHizmet);
    if (!hizmet) return;
    const adet = Number(miktar);
    if (!adet || adet <= 0) {
      setHata("Miktar sıfırdan büyük olmalıdır.");
      return;
    }
    setHata("");
    setKalemler([
      ...kalemler,
      {
        service_id: hizmet.id,
        item_name: hizmet.name,
        quantity: adet,
        unit_price: Number(hizmet.price),
        line_total: adet * Number(hizmet.price),
      },
    ]);
    setMiktar("1");
  }

  function kalemSil(index) {
    setKalemler(kalemler.filter((k, i) => i !== index));
  }

  let toplam = 0;
  kalemler.forEach((k) => (toplam += k.line_total));

  async function yeniMusteriKaydet() {
    setHata("");
    try {
      const cevap = await api.post("/customers", yeniMusteri);
      setSecilenMusteri(cevap.data);
      setYeniMusteriFormu(false);
      setYeniMusteri({ full_name: "", phone: "", address: "", district: "" });
    } catch (err) {
      setHata(hataMesaji(err));
    }
  }

  async function siparisOlustur() {
    setHata("");
    setBasarili("");
    try {
      const cevap = await api.post("/orders", {
        customer_id: secilenMusteri.id,
        delivery_type: teslimTipi,
        promised_date: sozVerilen,
        notes: not,
        items: kalemler.map((k) => ({
          service_id: k.service_id,
          item_name: k.item_name,
          quantity: k.quantity,
        })),
      });
      setBasarili(
        "Sipariş oluşturuldu: " + cevap.data.order_no +
        " — Barkodlar: " + cevap.data.items.map((i) => i.barcode).join(", ")
      );
      setTimeout(() => navigate("/siparisler/" + cevap.data.id), 1500);
    } catch (err) {
      setHata(hataMesaji(err));
    }
  }

  return (
    <div>
      <h1>Yeni Sipariş</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="kart">
        <h2>1. Müşteri</h2>

        {secilenMusteri ? (
          <div>
            <p style={{ marginTop: 0 }}>
              <strong>{secilenMusteri.full_name}</strong> — {secilenMusteri.phone}
              <br />
              <span style={{ color: "#6c757d" }}>
                {secilenMusteri.address} / {secilenMusteri.district}
              </span>
            </p>
            <button className="ikincil kucuk" onClick={() => setSecilenMusteri(null)}>
              Müşteriyi Değiştir
            </button>
          </div>
        ) : (
          <div>
            <label>Müşteri Ara (ad, telefon veya ilçe)</label>
            <input
              value={musteriArama}
              onChange={(e) => setMusteriArama(e.target.value)}
              placeholder="En az 2 harf yazın"
            />

            {musteriler.length > 0 && (
              <table>
                <tbody>
                  {musteriler.map((m) => (
                    <tr key={m.id} className="tiklanabilir" onClick={() => setSecilenMusteri(m)}>
                      <td>{m.full_name}</td>
                      <td>{m.phone}</td>
                      <td>{m.district}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 12 }}>
              <button className="ikincil kucuk" onClick={() => setYeniMusteriFormu(!yeniMusteriFormu)}>
                + Yeni Müşteri
              </button>
            </div>

            {yeniMusteriFormu && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #dee2e6" }}>
                <div className="form-satir">
                  <div>
                    <label>Ad Soyad</label>
                    <input
                      value={yeniMusteri.full_name}
                      onChange={(e) => setYeniMusteri({ ...yeniMusteri, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Telefon</label>
                    <input
                      value={yeniMusteri.phone}
                      onChange={(e) => setYeniMusteri({ ...yeniMusteri, phone: e.target.value })}
                      placeholder="+90 5xx xxx xx xx"
                    />
                  </div>
                </div>
                <div className="form-satir">
                  <div>
                    <label>Adres</label>
                    <input
                      value={yeniMusteri.address}
                      onChange={(e) => setYeniMusteri({ ...yeniMusteri, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>İlçe</label>
                    <input
                      value={yeniMusteri.district}
                      onChange={(e) => setYeniMusteri({ ...yeniMusteri, district: e.target.value })}
                    />
                  </div>
                </div>
                <button onClick={yeniMusteriKaydet}>Müşteriyi Kaydet</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="kart">
        <h2>2. Hizmetler</h2>

        <div className="filtre-cubugu">
          <div style={{ flex: 3 }}>
            <label>Hizmet</label>
            <select value={secilenHizmet} onChange={(e) => setSecilenHizmet(e.target.value)}>
              <option value="">Hizmet seçin</option>
              {hizmetler.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.unit}) — {paraFormat(h.price)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Miktar</label>
            <input type="number" step="0.5" min="0.5" value={miktar} onChange={(e) => setMiktar(e.target.value)} />
          </div>
          <button onClick={kalemEkle} disabled={!secilenHizmet}>Ekle</button>
        </div>

        {kalemler.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Hizmet</th>
                <th>Miktar</th>
                <th>Birim Fiyat</th>
                <th>Tutar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {kalemler.map((k, i) => (
                <tr key={i}>
                  <td>{k.item_name}</td>
                  <td>{k.quantity}</td>
                  <td>{paraFormat(k.unit_price)}</td>
                  <td>{paraFormat(k.line_total)}</td>
                  <td>
                    <button className="kirmizi kucuk" onClick={() => kalemSil(i)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="3">Toplam</th>
                <th>{paraFormat(toplam)}</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="bos-liste">Henüz hizmet eklenmedi.</div>
        )}
      </div>

      <div className="kart">
        <h2>3. Teslim</h2>

        <label>Teslim Tipi</label>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "inline-block", marginRight: 20, fontWeight: 400 }}>
            <input
              type="radio"
              checked={teslimTipi === "magaza"}
              onChange={() => setTeslimTipi("magaza")}
              style={{ width: "auto", marginRight: 6, marginBottom: 0 }}
            />
            Mağazadan Teslim
          </label>
          <label style={{ display: "inline-block", fontWeight: 400 }}>
            <input
              type="radio"
              checked={teslimTipi === "kurye"}
              onChange={() => setTeslimTipi("kurye")}
              style={{ width: "auto", marginRight: 6, marginBottom: 0 }}
            />
            Kurye ile Teslim
          </label>
        </div>

        <div className="form-satir">
          <div>
            <label>Söz Verilen Tarih</label>
            <input type="date" value={sozVerilen} onChange={(e) => setSozVerilen(e.target.value)} />
          </div>
          <div>
            <label>Notlar</label>
            <textarea rows="2" value={not} onChange={(e) => setNot(e.target.value)} />
          </div>
        </div>

        <button onClick={siparisOlustur} disabled={!secilenMusteri || kalemler.length === 0}>
          Siparişi Oluştur
        </button>
        {(!secilenMusteri || kalemler.length === 0) && (
          <span style={{ color: "#6c757d", marginLeft: 12, fontSize: 13 }}>
            Müşteri seçin ve en az bir hizmet ekleyin.
          </span>
        )}
      </div>
    </div>
  );
}

export default NewOrder;
