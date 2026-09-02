"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { para, tarih, REZERVASYON_DURUMLARI, KANALLAR } from "@/lib/bicim";

export default function RezervasyonlarSayfasi() {
  const [liste, setListe] = useState([]);
  const [durum, setDurum] = useState("");
  const [arama, setArama] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const yol = durum ? `/reservations?status=${durum}` : "/reservations";
      setListe(await api.get(yol));
      setHata("");
    } catch (e) {
      setHata(e.message);
    }
    setYukleniyor(false);
  }, [durum]);

  useEffect(() => { yukle(); }, [yukle]);

  // Arama tarayicida yapiliyor — liste zaten kucuk
  const gosterilen = liste.filter((r) => {
    if (!arama) return true;
    const metin = (r.guestName + " " + r.code + " " + r.roomNumber).toLocaleLowerCase("tr");
    return metin.includes(arama.toLocaleLowerCase("tr"));
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-lacivert mb-1">Rezervasyonlar</h1>
      <p className="text-sm text-gray-500 mb-5">Toplam {gosterilen.length} kayıt</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder="Misafir, kod veya oda ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-72"
        />
        <select
          value={durum}
          onChange={(e) => setDurum(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(REZERVASYON_DURUMLARI).map(([k, v]) => (
            <option key={k} value={k}>{v.etiket}</option>
          ))}
        </select>
      </div>

      {hata && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{hata}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Kod</th>
              <th className="text-left px-4 py-3">Misafir</th>
              <th className="text-left px-4 py-3">Oda</th>
              <th className="text-left px-4 py-3">Giriş</th>
              <th className="text-left px-4 py-3">Çıkış</th>
              <th className="text-right px-4 py-3">Gece</th>
              <th className="text-right px-4 py-3">Gecelik</th>
              <th className="text-left px-4 py-3">Kanal</th>
              <th className="text-left px-4 py-3">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {yukleniyor && (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">Yükleniyor...</td></tr>
            )}
            {!yukleniyor && gosterilen.length === 0 && (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
            )}
            {gosterilen.map((r) => {
              const d = REZERVASYON_DURUMLARI[r.status] || { etiket: r.status, renk: "bg-gray-100" };
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/rezervasyonlar/${r.id}`} className="text-lacivert-acik font-semibold hover:underline">
                      {r.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{r.guestName}</div>
                    <div className="text-xs text-gray-400">{r.guestPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{r.roomNumber}</div>
                    <div className="text-xs text-gray-400">{r.propertyName}</div>
                  </td>
                  <td className="px-4 py-3">{tarih(r.checkIn)}</td>
                  <td className="px-4 py-3">{tarih(r.checkOut)}</td>
                  <td className="px-4 py-3 text-right">{r.nights}</td>
                  <td className="px-4 py-3 text-right">{para(r.nightlyRate)}</td>
                  <td className="px-4 py-3 text-gray-500">{KANALLAR[r.channel] || r.channel}</td>
                  <td className="px-4 py-3">
                    <span className={"px-2 py-1 rounded-full text-xs font-medium " + d.renk}>{d.etiket}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
