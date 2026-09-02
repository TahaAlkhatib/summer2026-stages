"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function MisafirlerSayfasi() {
  const [liste, setListe] = useState([]);
  const [arama, setArama] = useState("");
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    try {
      setListe(await api.get("/guests?q=" + encodeURIComponent(arama)));
      setHata("");
    } catch (e) { setHata(e.message); }
  }, [arama]);

  useEffect(() => { yukle(); }, [yukle]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-lacivert mb-1">Misafirler</h1>
      <p className="text-sm text-gray-500 mb-5">{liste.length} kayıt</p>

      <input
        placeholder="Ad, telefon veya TC kimlik no ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-80 mb-4"
      />

      {hata && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{hata}</div>}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Ad Soyad</th>
              <th className="text-left px-4 py-3">TC Kimlik</th>
              <th className="text-left px-4 py-3">Telefon</th>
              <th className="text-left px-4 py-3">E-posta</th>
              <th className="text-left px-4 py-3">Ülke</th>
              <th className="text-right px-4 py-3">Konaklama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {liste.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
            )}
            {liste.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{m.fullName}</td>
                <td className="px-4 py-3 text-gray-500">{m.idNumber || "-"}</td>
                <td className="px-4 py-3">{m.phone || "-"}</td>
                <td className="px-4 py-3 text-gray-500">{m.email || "-"}</td>
                <td className="px-4 py-3">{m.country}</td>
                <td className="px-4 py-3 text-right">{m.stayCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
