"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { para, tarih, tarihSaat, gunMetni, ODEME_YONTEMLERI } from "@/lib/bicim";

export default function RaporlarSayfasi() {
  const [ozet, setOzet] = useState(null);
  const [doluluk, setDoluluk] = useState([]);
  const [gun, setGun] = useState(() => gunMetni(new Date()));
  const [gunluk, setGunluk] = useState(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    Promise.all([api.get("/reports/summary"), api.get("/reports/occupancy?days=14")])
      .then(([o, d]) => { setOzet(o); setDoluluk(d); })
      .catch((e) => setHata(e.message));
  }, []);

  const gunlukYukle = useCallback(async () => {
    try {
      setGunluk(await api.get("/reports/daily?date=" + gun));
    } catch (e) { setHata(e.message); }
  }, [gun]);

  useEffect(() => { gunlukYukle(); }, [gunlukYukle]);

  if (hata) return <div className="p-6 text-red-600">{hata}</div>;
  if (!ozet) return <div className="p-6 text-gray-400">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-lacivert">Raporlar</h1>
        <p className="text-sm text-gray-500">{tarih(ozet.date)} itibarıyla</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Kart baslik="Doluluk" deger={"%" + ozet.occupancyRate}
          alt={`${ozet.occupiedRooms} / ${ozet.totalRooms} oda`} renk="text-lacivert" />
        <Kart baslik="Bugün giriş" deger={ozet.todayCheckIns} alt="bekleyen check-in" renk="text-blue-600" />
        <Kart baslik="Bugün çıkış" deger={ozet.todayCheckOuts} alt="bekleyen check-out" renk="text-bakir" />
        <Kart baslik="İçerideki" deger={ozet.inHouse} alt="konaklayan misafir" renk="text-green-700" />
        <Kart baslik="Açık görev" deger={ozet.openTasks} alt="temizlik / bakım" renk="text-amber-600" />
        <Kart baslik="Ay geliri" deger={para(ozet.monthRevenue)} alt="tahsil edilen" renk="text-lacivert" />
      </div>

      <section className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-lacivert mb-4">14 Günlük Doluluk</h2>
        <div className="flex items-end gap-1 h-40">
          {doluluk.map((g) => (
            <div key={g.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${g.occupied}/${g.total} oda`}>
              <div className="text-[10px] text-gray-500 mb-1">%{g.rate}</div>
              <div
                className="w-full bg-lacivert-acik rounded-t transition-all"
                style={{ height: Math.max(4, g.rate) + "%" }}
              />
              <div className="text-[10px] text-gray-400 mt-1">{g.date.slice(8)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-lacivert">Gün Sonu Raporu</h2>
          <input type="date" value={gun} onChange={(e) => setGun(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
        </div>

        {!gunluk ? (
          <p className="text-gray-400 text-sm">Yükleniyor...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Kart baslik="Nakit" deger={para(gunluk.cash)} renk="text-green-700" />
              <Kart baslik="Kredi Kartı" deger={para(gunluk.card)} renk="text-blue-600" />
              <Kart baslik="Havale" deger={para(gunluk.transfer)} renk="text-purple-600" />
              <Kart baslik="Toplam" deger={para(gunluk.total)} alt={gunluk.paymentCount + " tahsilat"} renk="text-lacivert" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Liste baslik={`Girişler (${gunluk.checkIns.length})`} bos="Giriş yok">
                {gunluk.checkIns.map((r) => (
                  <li key={r.code} className="flex justify-between py-1.5">
                    <span>{r.guestName} <span className="text-gray-400">· {r.roomNumber}</span></span>
                    <span className="text-gray-400 text-xs">{tarihSaat(r.at).slice(11)}</span>
                  </li>
                ))}
              </Liste>

              <Liste baslik={`Çıkışlar (${gunluk.checkOuts.length})`} bos="Çıkış yok">
                {gunluk.checkOuts.map((r) => (
                  <li key={r.code} className="flex justify-between py-1.5">
                    <span>{r.guestName} <span className="text-gray-400">· {r.roomNumber}</span></span>
                    <span className="text-gray-400 text-xs">{tarihSaat(r.at).slice(11)}</span>
                  </li>
                ))}
              </Liste>

              <Liste baslik={`Tahsilatlar (${gunluk.payments.length})`} bos="Tahsilat yok">
                {gunluk.payments.map((o) => (
                  <li key={o.id} className="flex justify-between py-1.5">
                    <span>
                      {o.guestName}
                      <span className="text-gray-400 text-xs"> · {ODEME_YONTEMLERI[o.method] || o.method}</span>
                    </span>
                    <span className="font-medium">{para(o.amount)}</span>
                  </li>
                ))}
              </Liste>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Bu gün {gunluk.completedTasks} temizlik/bakım görevi tamamlandı.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function Kart({ baslik, deger, alt, renk }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs text-gray-500">{baslik}</div>
      <div className={"text-xl font-bold mt-1 " + (renk || "")}>{deger}</div>
      {alt && <div className="text-[11px] text-gray-400">{alt}</div>}
    </div>
  );
}

function Liste({ baslik, bos, children }) {
  const dolu = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-2">{baslik}</h3>
      {dolu ? (
        <ul className="text-sm divide-y divide-gray-100">{children}</ul>
      ) : (
        <p className="text-sm text-gray-300">{bos}</p>
      )}
    </div>
  );
}
