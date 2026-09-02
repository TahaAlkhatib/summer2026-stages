"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { para, ODA_DURUMLARI } from "@/lib/bicim";

export default function OdalarSayfasi() {
  const [odalar, setOdalar] = useState([]);
  const [tesisler, setTesisler] = useState([]);
  const [seciliTesis, setSeciliTesis] = useState("");
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");

  useEffect(() => {
    api.get("/rooms/properties").then(setTesisler).catch(() => {});
  }, []);

  const yukle = useCallback(async () => {
    try {
      const yol = seciliTesis ? `/rooms?propertyId=${seciliTesis}` : "/rooms";
      setOdalar(await api.get(yol));
      setHata("");
    } catch (e) { setHata(e.message); }
  }, [seciliTesis]);

  useEffect(() => { yukle(); }, [yukle]);

  async function durumDegistir(oda, yeniDurum) {
    setBilgi("");
    try {
      await api.put(`/rooms/${oda._id}/status`, { status: yeniDurum });
      setBilgi(`${oda.number} nolu oda "${ODA_DURUMLARI[yeniDurum].etiket}" olarak işaretlendi.`);
      yukle();
    } catch (e) { setHata(e.message); }
  }

  // Odalari kata gore gruplayalim, listede daha okunakli oluyor
  const katlar = {};
  odalar.forEach((o) => {
    const anahtar = (o.property ? o.property.name : "") + " · " + o.floor + ". Kat";
    if (!katlar[anahtar]) katlar[anahtar] = [];
    katlar[anahtar].push(o);
  });

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-lacivert">Odalar</h1>
          <p className="text-sm text-gray-500">{odalar.length} oda</p>
        </div>
        <select value={seciliTesis} onChange={(e) => setSeciliTesis(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Tüm tesisler</option>
          {tesisler.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      {hata && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{hata}</div>}
      {bilgi && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{bilgi}</div>}

      <div className="space-y-6">
        {Object.keys(katlar).map((kat) => (
          <div key={kat}>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">{kat}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {katlar[kat].map((o) => {
                const d = ODA_DURUMLARI[o.status] || { etiket: o.status, renk: "bg-gray-100" };
                return (
                  <div key={o._id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start justify-between">
                      <div className="text-lg font-bold text-lacivert">{o.number}</div>
                      <span className={"text-[10px] px-2 py-0.5 rounded-full font-medium " + d.renk}>
                        {d.etiket}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{o.type}</div>
                    <div className="text-xs text-gray-400">{o.capacity} kişilik</div>
                    <div className="text-sm font-semibold text-bakir mt-2">{para(o.nightlyRate)}</div>

                    <select
                      value={o.status}
                      onChange={(e) => durumDegistir(o, e.target.value)}
                      className="w-full mt-3 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white"
                    >
                      {Object.entries(ODA_DURUMLARI).map(([k, v]) => (
                        <option key={k} value={k}>{v.etiket}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
