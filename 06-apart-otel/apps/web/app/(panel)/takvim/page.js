"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  para, gunMetni, gunEkle, gunFarki, gunAdi, ayAdi, haftaSonuMu,
  REZERVASYON_DURUMLARI,
} from "@/lib/bicim";
import YeniRezervasyon from "./YeniRezervasyon";

const GUN_SAYISI = 14;

// Rezervasyon cubugunun rengi duruma gore degisir
const CUBUK_RENKLERI = {
  onaylandi: "bg-blue-500 hover:bg-blue-600",
  giris_yapildi: "bg-green-600 hover:bg-green-700",
  cikis_yapildi: "bg-gray-400 hover:bg-gray-500",
};

export default function TakvimSayfasi() {
  const router = useRouter();

  const [baslangic, setBaslangic] = useState(() => gunMetni(new Date()));
  const [tesisler, setTesisler] = useState([]);
  const [seciliTesis, setSeciliTesis] = useState("");
  const [odalar, setOdalar] = useState([]);
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [suruklenen, setSuruklenen] = useState(null);
  const [hedef, setHedef] = useState(null);
  const [yeniAcik, setYeniAcik] = useState(false);
  const [yeniBaslangic, setYeniBaslangic] = useState(null);

  const bitis = gunEkle(baslangic, GUN_SAYISI);

  const gunler = [];
  for (let i = 0; i < GUN_SAYISI; i++) {
    gunler.push(gunEkle(baslangic, i));
  }

  useEffect(() => {
    api.get("/rooms/properties").then(setTesisler).catch(() => {});
  }, []);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata("");
    try {
      const odaYolu = seciliTesis ? `/rooms?propertyId=${seciliTesis}` : "/rooms";
      const [odaListesi, rezListesi] = await Promise.all([
        api.get(odaYolu),
        api.get(`/reservations?from=${baslangic}&to=${bitis}`),
      ]);
      setOdalar(odaListesi);
      setRezervasyonlar(rezListesi);
    } catch (e) {
      setHata(e.message);
    }
    setYukleniyor(false);
  }, [baslangic, bitis, seciliTesis]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  // Cubugun takvimdeki yeri: yuzde olarak sol kenar ve genislik
  function cubukKonumu(rez) {
    const basGun = Math.max(0, gunFarki(baslangic, rez.checkIn));
    const bitGun = Math.min(GUN_SAYISI, gunFarki(baslangic, rez.checkOut));
    const genislik = bitGun - basGun;
    return {
      left: (basGun / GUN_SAYISI) * 100 + "%",
      width: (genislik / GUN_SAYISI) * 100 + "%",
      gorunur: genislik > 0,
    };
  }

  async function birak(odaId, gun) {
    if (!suruklenen) return;
    setHedef(null);

    const rez = suruklenen;
    setSuruklenen(null);

    // Ayni yere birakildiysa istek gondermeye gerek yok
    if (rez.roomId === odaId && rez.checkIn === gun) return;

    const yeniCikis = gunEkle(gun, rez.nights);

    try {
      await api.put(`/reservations/${rez.id}/move`, {
        roomId: odaId,
        checkIn: gun,
        checkOut: yeniCikis,
      });
      await yukle();
    } catch (e) {
      setHata(e.message);
      // Hata mesaji birkac saniye sonra kaybolsun
      setTimeout(() => setHata(""), 5000);
    }
  }

  const bugun = gunMetni(new Date());

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-lacivert">Oda Takvimi</h1>
          <p className="text-sm text-gray-500">
            Rezervasyonu sürükleyip başka bir odaya veya güne bırakabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            value={seciliTesis}
            onChange={(e) => setSeciliTesis(e.target.value)}
          >
            <option value="">Tüm tesisler</option>
            {tesisler.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>

          <button
            onClick={() => setBaslangic(gunEkle(baslangic, -7))}
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            ‹ Önceki
          </button>
          <button
            onClick={() => setBaslangic(bugun)}
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            Bugün
          </button>
          <button
            onClick={() => setBaslangic(gunEkle(baslangic, 7))}
            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            Sonraki ›
          </button>

          <button
            onClick={() => { setYeniBaslangic(null); setYeniAcik(true); }}
            className="bg-bakir hover:bg-bakir-acik text-white rounded-lg px-4 py-2 text-sm font-semibold"
          >
            + Yeni Rezervasyon
          </button>
        </div>
      </div>

      {hata && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {hata}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Gun basliklari */}
          <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="w-48 shrink-0 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
              {ayAdi(baslangic)} {new Date(baslangic + "T00:00:00").getFullYear()}
            </div>
            <div className="flex-1 flex">
              {gunler.map((g) => (
                <div
                  key={g}
                  className={
                    "flex-1 text-center py-2 border-l border-gray-100 " +
                    (g === bugun ? "bg-bakir/10" : haftaSonuMu(g) ? "bg-gray-50" : "")
                  }
                >
                  <div className="text-[11px] text-gray-400">{gunAdi(g)}</div>
                  <div className={"text-sm " + (g === bugun ? "font-bold text-bakir" : "text-gray-700")}>
                    {g.slice(8)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {yukleniyor ? (
            <div className="p-10 text-center text-gray-400">Yükleniyor...</div>
          ) : (
            odalar.map((oda) => {
              const odaRezervasyonlari = rezervasyonlar.filter((r) => r.roomId === oda._id);

              return (
                <div key={oda._id} className="flex border-b border-gray-100 hover:bg-gray-50/50">
                  <div className="w-48 shrink-0 px-4 py-3">
                    <div className="font-semibold text-sm text-lacivert">{oda.number}</div>
                    <div className="text-[11px] text-gray-500">{oda.type}</div>
                    <div className="text-[11px] text-gray-400">
                      {oda.property ? oda.property.name : ""} · {para(oda.nightlyRate)}
                    </div>
                  </div>

                  <div className="flex-1 relative min-h-[62px]">
                    {/* Gun hucreleri — birakma hedefleri */}
                    <div className="absolute inset-0 flex">
                      {gunler.map((g) => {
                        const seciliHedef = hedef && hedef.odaId === oda._id && hedef.gun === g;
                        return (
                          <div
                            key={g}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (!seciliHedef) setHedef({ odaId: oda._id, gun: g });
                            }}
                            onDrop={() => birak(oda._id, g)}
                            onDoubleClick={() => { setYeniBaslangic({ odaId: oda._id, gun: g }); setYeniAcik(true); }}
                            className={
                              "flex-1 border-l border-gray-100 " +
                              (seciliHedef ? "bg-bakir/20" : g === bugun ? "bg-bakir/5" : haftaSonuMu(g) ? "bg-gray-50/60" : "")
                            }
                          />
                        );
                      })}
                    </div>

                    {/* Rezervasyon cubuklari */}
                    {odaRezervasyonlari.map((r) => {
                      const konum = cubukKonumu(r);
                      if (!konum.gorunur) return null;

                      return (
                        <div
                          key={r.id}
                          draggable
                          onDragStart={() => setSuruklenen(r)}
                          onDragEnd={() => { setSuruklenen(null); setHedef(null); }}
                          onClick={() => router.push(`/rezervasyonlar/${r.id}`)}
                          title={`${r.code} — ${r.guestName}\n${r.checkIn} → ${r.checkOut} (${r.nights} gece)`}
                          style={{ left: konum.left, width: konum.width }}
                          className={
                            "absolute top-2 bottom-2 mx-[2px] rounded-md px-2 py-1 text-white text-xs cursor-move overflow-hidden transition " +
                            (CUBUK_RENKLERI[r.status] || "bg-gray-400") +
                            (suruklenen && suruklenen.id === r.id ? " opacity-50" : "")
                          }
                        >
                          <div className="font-semibold truncate leading-tight">{r.guestName}</div>
                          <div className="truncate text-[10px] opacity-90">{r.code}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
        {Object.entries(REZERVASYON_DURUMLARI)
          .filter(([k]) => k !== "iptal")
          .map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className={"w-4 h-3 rounded " + (CUBUK_RENKLERI[k] || "bg-gray-400").split(" ")[0]} />
              {v.etiket}
            </div>
          ))}
        <div className="text-gray-400">
          İpucu: boş bir güne çift tıklayarak da rezervasyon açabilirsiniz.
        </div>
      </div>

      {yeniAcik && (
        <YeniRezervasyon
          baslangicBilgisi={yeniBaslangic}
          onKapat={() => setYeniAcik(false)}
          onKaydedildi={() => { setYeniAcik(false); yukle(); }}
        />
      )}
    </div>
  );
}
