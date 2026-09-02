"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, oturumKaydet } from "@/lib/api";

export default function GirisSayfasi() {
  const router = useRouter();
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  async function girisYap(e) {
    e.preventDefault();
    setHata("");
    setBekliyor(true);

    try {
      const cevap = await api.post("/auth/login", {
        username: kullaniciAdi.trim(),
        password: sifre,
      });
      oturumKaydet(cevap.token, cevap.user);

      // Temizlik ve teknik personel panel yerine gorev ekranina gitsin
      if (cevap.user.role === "temizlik" || cevap.user.role === "teknik") {
        router.push("/gorevler");
      } else {
        router.push("/takvim");
      }
    } catch (e) {
      setHata(e.message);
      setBekliyor(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-lacivert px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-lacivert-acik px-8 py-7 text-center">
          <h1 className="text-2xl font-bold text-white">Apart &amp; Otel Yönetimi</h1>
          <p className="text-sm text-bakir-acik mt-1">Rezervasyon ve Görev Takip Sistemi</p>
        </div>

        <form onSubmit={girisYap} className="px-8 py-7 space-y-4">
          {hata && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {hata}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Kullanıcı Adı</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lacivert-acik"
              value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Şifre</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lacivert-acik"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={bekliyor}
            className="w-full bg-bakir hover:bg-bakir-acik disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 transition"
          >
            {bekliyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          <div className="text-center text-xs text-gray-500 pt-2 leading-relaxed">
            Demo: <b>resepsiyon / 123456</b> (ön büro)
            <br />
            <b>temizlik1 / 123456</b> (temizlik ekibi)
          </div>
        </form>
      </div>
    </div>
  );
}
