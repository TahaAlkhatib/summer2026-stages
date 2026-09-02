import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { hataMesaji } from "../api";
import { kalanGun, paraFormat, tarihFormat, tarihSaatFormat, yerelTarih } from "../ortak";

function MemberDetail() {
  const { id } = useParams();
  const [uye, setUye] = useState(null);
  const [paketler, setPaketler] = useState([]);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  const [secilenPaket, setSecilenPaket] = useState("");
  const [baslangic, setBaslangic] = useState(yerelTarih());
  const [pesinat, setPesinat] = useState("");
  const [yontem, setYontem] = useState("nakit");

  const [odemeUyelik, setOdemeUyelik] = useState(null);
  const [odemeTutar, setOdemeTutar] = useState("");

  function yukle() {
    api.get("/members/" + id).then((c) => setUye(c.data)).catch((e) => setHata(hataMesaji(e)));
  }

  useEffect(() => {
    yukle();
    api.get("/packages", { params: { active: 1 } }).then((c) => setPaketler(c.data)).catch(() => {});
  }, [id]);

  async function paketSat() {
    setHata("");
    setBasarili("");
    try {
      const cevap = await api.post("/members/" + id + "/memberships", {
        package_id: Number(secilenPaket),
        start_date: baslangic,
        paid_amount: Number(pesinat) || 0,
        method: yontem,
      });
      setBasarili("Üyelik oluşturuldu: " + cevap.data.package_name +
                  " (" + tarihFormat(cevap.data.end_date) + " tarihine kadar)");
      setSecilenPaket("");
      setPesinat("");
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  async function tahsilEt() {
    setHata("");
    setBasarili("");
    try {
      const cevap = await api.post("/members/memberships/" + odemeUyelik.id + "/payments", {
        amount: Number(odemeTutar),
        method: yontem,
      });
      setBasarili("Tahsilat alındı. Kalan borç: " + paraFormat(cevap.data.remaining));
      setOdemeUyelik(null);
      setOdemeTutar("");
      yukle();
    } catch (e) {
      setHata(hataMesaji(e));
    }
  }

  if (!uye) return hata ? <div className="hata">{hata}</div> : <div>Yükleniyor...</div>;

  const aktifUyelik = uye.memberships.find(
    (m) => m.status === "aktif" && String(m.end_date).slice(0, 10) >= yerelTarih()
  );

  return (
    <div>
      <h1>{uye.full_name}</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="satir">
        <div className="kart">
          <h2>Üye Bilgileri</h2>
          <p><strong>Telefon:</strong> {uye.phone}</p>
          <p><strong>E-posta:</strong> {uye.email || "-"}</p>
          <p><strong>Doğum Tarihi:</strong> {tarihFormat(uye.birth_date)}</p>
          <p><strong>QR Kodu:</strong> <code style={{ color: "#ffb703" }}>{uye.qr_code}</code></p>
          <p><strong>RFID Kart:</strong> {uye.rfid_card || "-"}</p>
          <p><strong>Durum:</strong>{" "}
            <span className={"rozet " + (uye.is_active ? "aktif" : "bitti")}>
              {uye.is_active ? "Aktif" : "Dondurulmuş"}
            </span>
          </p>
          {uye.notes && <p><strong>Not:</strong> {uye.notes}</p>}
        </div>

        <div className="kart">
          <h2>Güncel Üyelik</h2>
          {aktifUyelik ? (
            <div>
              <p><strong>Paket:</strong> {aktifUyelik.package_name}</p>
              <p><strong>Başlangıç:</strong> {tarihFormat(aktifUyelik.start_date)}</p>
              <p><strong>Bitiş:</strong> {tarihFormat(aktifUyelik.end_date)}{" "}
                <span className="rozet uyari">{kalanGun(aktifUyelik.end_date)} gün kaldı</span>
              </p>
              <p><strong>Kalan Seans:</strong>{" "}
                {aktifUyelik.remaining_sessions === null ? "Sınırsız" : aktifUyelik.remaining_sessions}
              </p>
              <p><strong>Ücret:</strong> {paraFormat(aktifUyelik.total_price)}{" "}
                (ödenen {paraFormat(aktifUyelik.paid_amount)})</p>
              {Number(aktifUyelik.total_price) > Number(aktifUyelik.paid_amount) && (
                <button className="kucuk" onClick={() => {
                  setOdemeUyelik(aktifUyelik);
                  setOdemeTutar(String(Number(aktifUyelik.total_price) - Number(aktifUyelik.paid_amount)));
                }}>
                  Kalan Borcu Tahsil Et
                </button>
              )}
            </div>
          ) : (
            <div className="bos">Geçerli üyelik bulunmuyor.</div>
          )}
        </div>
      </div>

      {odemeUyelik && (
        <div className="kart">
          <h2>Tahsilat</h2>
          <div className="satir">
            <div>
              <label>Tutar (₺)</label>
              <input type="number" step="0.01" value={odemeTutar}
                     onChange={(e) => setOdemeTutar(e.target.value)} />
            </div>
            <div>
              <label>Yöntem</label>
              <select value={yontem} onChange={(e) => setYontem(e.target.value)}>
                <option value="nakit">Nakit</option>
                <option value="kart">Kart</option>
                <option value="havale">Havale</option>
              </select>
            </div>
          </div>
          <button onClick={tahsilEt} disabled={!odemeTutar}>Tahsil Et</button>
          <button className="ikincil" style={{ marginLeft: 8 }}
                  onClick={() => setOdemeUyelik(null)}>Vazgeç</button>
        </div>
      )}

      <div className="kart">
        <h2>Yeni Paket Sat</h2>
        <div className="satir">
          <div style={{ flex: 2 }}>
            <label>Paket</label>
            <select value={secilenPaket} onChange={(e) => setSecilenPaket(e.target.value)}>
              <option value="">Paket seçin</option>
              {paketler.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.duration_days} gün
                  {p.session_count ? " / " + p.session_count + " seans" : " / sınırsız"} — {paraFormat(p.price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Başlangıç</label>
            <input type="date" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} />
          </div>
          <div>
            <label>Peşinat (₺)</label>
            <input type="number" step="0.01" value={pesinat}
                   onChange={(e) => setPesinat(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label>Yöntem</label>
            <select value={yontem} onChange={(e) => setYontem(e.target.value)}>
              <option value="nakit">Nakit</option>
              <option value="kart">Kart</option>
              <option value="havale">Havale</option>
            </select>
          </div>
        </div>
        <button onClick={paketSat} disabled={!secilenPaket}>Paketi Sat</button>
      </div>

      <div className="kart">
        <h2>Üyelik Geçmişi</h2>
        <table>
          <thead>
            <tr>
              <th>Paket</th><th>Başlangıç</th><th>Bitiş</th>
              <th>Kalan Seans</th><th>Ücret</th><th>Ödenen</th><th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {uye.memberships.map((m) => (
              <tr key={m.id}>
                <td>{m.package_name}</td>
                <td>{tarihFormat(m.start_date)}</td>
                <td>{tarihFormat(m.end_date)}</td>
                <td>{m.remaining_sessions === null ? "Sınırsız" : m.remaining_sessions}</td>
                <td>{paraFormat(m.total_price)}</td>
                <td>{paraFormat(m.paid_amount)}</td>
                <td><span className={"rozet " + m.status}>{m.status === "aktif" ? "Aktif" : "Bitti"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="kart">
        <h2>Son Giriş Kayıtları</h2>
        <table>
          <thead>
            <tr><th>Tarih</th><th>Turnike</th><th>Yöntem</th><th>Sonuç</th><th>Açıklama</th></tr>
          </thead>
          <tbody>
            {uye.recent_checkins.map((g) => (
              <tr key={g.id}>
                <td>{tarihSaatFormat(g.created_at)}</td>
                <td>{g.gate_name || "-"}</td>
                <td>{g.method === "qr" ? "QR" : g.method === "rfid" ? "RFID" : "Manuel"}</td>
                <td>
                  <span className={"rozet " + g.result}>
                    {g.result === "izin" ? "İzin" : "Ret"}
                  </span>
                </td>
                <td>{g.reject_reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {uye.recent_checkins.length === 0 && <div className="bos">Giriş kaydı yok.</div>}
      </div>
    </div>
  );
}

export default MemberDetail;
