"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function GirisSayfasi() {
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const router = useRouter();

  async function girisYap(e) {
    e.preventDefault();
    setHata("");
    setBekliyor(true);

    try {
      const cevap = await api.post("/auth/login", {
        username: kullaniciAdi,
        password: sifre,
      });
      localStorage.setItem("token", cevap.token);
      localStorage.setItem("user", JSON.stringify(cevap.user));
      router.replace("/panel");
    } catch (err) {
      setHata(err.message);
      setBekliyor(false);
    }
  }

  return (
    <div className="giris-sayfa">
      <form className="giris-kart" onSubmit={girisYap}>
        <h1>Oto Servis</h1>
        <div className="alt">Yönetim Paneli</div>

        {hata && <div className="hata">{hata}</div>}

        <label>Kullanıcı Adı</label>
        <input value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} autoFocus />

        <label>Şifre</label>
        <input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} />

        <button type="submit" disabled={bekliyor} style={{ width: "100%" }}>
          {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <div className="ipucu">Demo: danisman1 / 123456</div>
      </form>
    </div>
  );
}
