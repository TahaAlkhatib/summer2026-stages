import { useEffect, useRef, useState } from "react";
import api, { hataMesaji } from "../api";
import { tarihFormat, tarihSaatFormat } from "../ortak";

// Turnike simülasyon ekranı.
// Gerçek hayatta QR okuyucu / RFID okuyucu klavye gibi davranıp kodun sonuna
// Enter gönderir; bu ekran da aynı şekilde çalışır.
function Turnstile() {
  const [kod, setKod] = useState("");
  const [sonuc, setSonuc] = useState(null);
  const [kapilar, setKapilar] = useState([]);
  const [kapi, setKapi] = useState("");
  const [yontem, setYontem] = useState("qr");
  const [gecmis, setGecmis] = useState([]);
  const [hata, setHata] = useState("");
  const girisAlani = useRef(null);

  useEffect(() => {
    api.get("/checkins/gates").then((c) => {
      setKapilar(c.data);
      if (c.data.length > 0) setKapi(String(c.data[0].id));
    }).catch(() => {});
    gecmisiYukle();
  }, []);

  function gecmisiYukle() {
    api.get("/checkins").then((c) => setGecmis(c.data.slice(0, 15))).catch(() => {});
  }

  async function okut(e) {
    if (e) e.preventDefault();
    if (!kod.trim()) return;

    setHata("");
    try {
      const cevap = await api.post("/checkins/scan", {
        code: kod.trim(),
        method: yontem,
        gateId: kapi ? Number(kapi) : null,
      });
      setSonuc(cevap.data);
      setKod("");
      gecmisiYukle();
      // Arka arkaya okutma için alana geri odaklan
      if (girisAlani.current) girisAlani.current.focus();
    } catch (err) {
      setHata(hataMesaji(err));
    }
  }

  return (
    <div>
      <h1>Turnike Kontrol</h1>

      {hata && <div className="hata">{hata}</div>}

      <div className="kart">
        <h2>Kart / QR Okut</h2>
        <form onSubmit={okut}>
          <div className="filtreler">
            <div style={{ flex: 3 }}>
              <label>Kod (okuyucu otomatik gönderir)</label>
              <input
                ref={girisAlani}
                className="barkod-alani"
                value={kod}
                onChange={(e) => setKod(e.target.value.toUpperCase())}
                placeholder="UYE-2026-00001 veya RFID kart no"
                autoFocus
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Yöntem</label>
              <select value={yontem} onChange={(e) => setYontem(e.target.value)}>
                <option value="qr">QR Kod</option>
                <option value="rfid">RFID Kart</option>
                <option value="manuel">Manuel</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Turnike</label>
              <select value={kapi} onChange={(e) => setKapi(e.target.value)}>
                {kapilar.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
            <button type="submit">Okut</button>
          </div>
        </form>
      </div>

      {sonuc && (
        <div className={"turnike-kutu " + (sonuc.allowed ? "izin" : "red")}>
          <div className="sonuc">{sonuc.allowed ? "GİRİŞ İZNİ" : "GİRİŞ REDDEDİLDİ"}</div>
          {sonuc.member && <div className="uye">{sonuc.member.full_name}</div>}
          {sonuc.allowed && sonuc.membership && (
            <div className="detay">
              {sonuc.membership.package_name}
              {" · Bitiş: " + tarihFormat(sonuc.membership.end_date)}
              {sonuc.membership.unlimited
                ? " · Sınırsız giriş"
                : " · Kalan seans: " + sonuc.membership.remaining_sessions}
              {sonuc.first_entry_today === false && " · (bugün ikinci giriş, seans düşülmedi)"}
            </div>
          )}
          {!sonuc.allowed && <div className="detay">{sonuc.reason}</div>}
        </div>
      )}

      <div className="kart">
        <h2>Son Giriş Kayıtları</h2>
        <table>
          <thead>
            <tr>
              <th>Saat</th><th>Üye</th><th>Turnike</th>
              <th>Yöntem</th><th>Sonuç</th><th>Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {gecmis.map((g) => (
              <tr key={g.id}>
                <td>{tarihSaatFormat(g.created_at)}</td>
                <td>{g.member_name || <span style={{ color: "#8b9bab" }}>{g.scanned_code}</span>}</td>
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
        {gecmis.length === 0 && <div className="bos">Henüz giriş kaydı yok.</div>}
      </div>
    </div>
  );
}

export default Turnstile;
