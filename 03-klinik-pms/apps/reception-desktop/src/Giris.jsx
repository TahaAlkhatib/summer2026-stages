import { useState } from "react";
import api, { hataMesaji } from "./api";

function Giris({ onGiris }) {
  const [kullanici, setKullanici] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function girisYap(e) {
    e.preventDefault();
    setHata("");
    setBekliyor(true);
    try {
      const cevap = await api.post("/auth/login", { username: kullanici, password: sifre });
      localStorage.setItem("token", cevap.data.token);
      localStorage.setItem("user", JSON.stringify(cevap.data.user));
      onGiris(cevap.data.user);
    } catch (err) {
      setHata(hataMesaji(err));
      setBekliyor(false);
    }
  }

  return (
    <div className="giris-sayfa">
      <form className="giris-kart" onSubmit={girisYap}>
        <h1>Klinik Resepsiyon</h1>
        <div className="alt">Masaüstü uygulaması</div>

        {hata && <div className="hata">{hata}</div>}

        <label>Kullanıcı Adı</label>
        <input value={kullanici} onChange={(e) => setKullanici(e.target.value)} autoFocus />

        <label>Şifre</label>
        <input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} />

        <button type="submit" disabled={bekliyor} style={{ width: "100%" }}>
          {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <div className="ipucu">Demo: resepsiyon1 / 123456</div>
      </form>
    </div>
  );
}

export default Giris;
