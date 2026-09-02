"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { para, gunMetni, gunEkle, gunFarki, KANALLAR } from "@/lib/bicim";

// Yeni rezervasyon penceresi.
// Once tarih araligi secilir, musait odalar listelenir, sonra misafir bilgisi girilir.
export default function YeniRezervasyon({ baslangicBilgisi, onKapat, onKaydedildi }) {
  const bugun = gunMetni(new Date());

  const [giris, setGiris] = useState(baslangicBilgisi ? baslangicBilgisi.gun : bugun);
  const [cikis, setCikis] = useState(
    baslangicBilgisi ? gunEkle(baslangicBilgisi.gun, 2) : gunEkle(bugun, 2)
  );
  const [odalar, setOdalar] = useState([]);
  const [seciliOda, setSeciliOda] = useState(baslangicBilgisi ? baslangicBilgisi.odaId : "");

  const [misafirler, setMisafirler] = useState([]);
  const [seciliMisafir, setSeciliMisafir] = useState("");
  const [yeniMisafir, setYeniMisafir] = useState({ fullName: "", idNumber: "", phone: "", email: "" });

  const [yetiskin, setYetiskin] = useState(2);
  const [cocuk, setCocuk] = useState(0);
  const [kanal, setKanal] = useState("telefon");
  const [not, setNot] = useState("");

  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);

  const gece = gunFarki(giris, cikis);

  useEffect(() => {
    api.get("/guests").then(setMisafirler).catch(() => {});
  }, []);

  useEffect(() => {
    if (gece < 1) {
      setOdalar([]);
      return;
    }
    api
      .get(`/reservations/availability/search?from=${giris}&to=${cikis}`)
      .then((liste) => {
        setOdalar(liste);
        // Secili oda artik musait degilse secimi temizle
        const secili = liste.find((o) => o.id === seciliOda);
        if (secili && !secili.available) setSeciliOda("");
      })
      .catch((e) => setHata(e.message));
    // seciliOda bagimliliga eklenirse her secimde istek gider, o yuzden yok
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giris, cikis, gece]);

  const odaBilgisi = odalar.find((o) => o.id === seciliOda);
  const toplam = odaBilgisi ? odaBilgisi.nightlyRate * gece : 0;

  async function kaydet(e) {
    e.preventDefault();
    setHata("");

    if (gece < 1) {
      setHata("Çıkış tarihi giriş tarihinden sonra olmalıdır.");
      return;
    }
    if (!seciliOda) {
      setHata("Lütfen bir oda seçin.");
      return;
    }
    if (!seciliMisafir && !yeniMisafir.fullName.trim()) {
      setHata("Misafir seçin veya yeni misafir adını yazın.");
      return;
    }

    setBekliyor(true);
    try {
      await api.post("/reservations", {
        roomId: seciliOda,
        guestId: seciliMisafir || undefined,
        guest: seciliMisafir ? undefined : yeniMisafir,
        checkIn: giris,
        checkOut: cikis,
        adults: Number(yetiskin),
        children: Number(cocuk),
        channel: kanal,
        notes: not,
      });
      onKaydedildi();
    } catch (e) {
      setHata(e.message);
      setBekliyor(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto p-6 z-50">
      <form
        onSubmit={kaydet}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-4"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-lacivert">Yeni Rezervasyon</h2>
          <button type="button" onClick={onKapat} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {hata && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {hata}
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            <Alan etiket="Giriş Tarihi">
              <input type="date" value={giris} onChange={(e) => setGiris(e.target.value)} className={girdiStil} />
            </Alan>
            <Alan etiket="Çıkış Tarihi">
              <input type="date" value={cikis} onChange={(e) => setCikis(e.target.value)} className={girdiStil} />
            </Alan>
            <Alan etiket="Yetişkin">
              <input type="number" min="1" value={yetiskin} onChange={(e) => setYetiskin(e.target.value)} className={girdiStil} />
            </Alan>
            <Alan etiket="Çocuk">
              <input type="number" min="0" value={cocuk} onChange={(e) => setCocuk(e.target.value)} className={girdiStil} />
            </Alan>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">
              Müsait Odalar {gece > 0 && <span className="text-gray-400 font-normal">({gece} gece)</span>}
            </div>
            <div className="border border-gray-200 rounded-lg max-h-52 overflow-y-auto divide-y divide-gray-100">
              {odalar.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Tarih aralığı seçin.
                </div>
              )}
              {odalar.map((o) => (
                <button
                  type="button"
                  key={o.id}
                  disabled={!o.available}
                  onClick={() => setSeciliOda(o.id)}
                  className={
                    "w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition " +
                    (!o.available
                      ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                      : seciliOda === o.id
                      ? "bg-lacivert text-white"
                      : "hover:bg-gray-50")
                  }
                >
                  <span>
                    <b>{o.number}</b> — {o.type}
                    <span className={"ml-2 text-xs " + (seciliOda === o.id ? "text-white/70" : "text-gray-400")}>
                      {o.propertyName} · {o.capacity} kişilik
                    </span>
                  </span>
                  <span>
                    {o.available ? para(o.nightlyRate) + " / gece" : "Dolu"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-700 mb-2">Misafir</div>
            <select
              className={girdiStil + " mb-3"}
              value={seciliMisafir}
              onChange={(e) => setSeciliMisafir(e.target.value)}
            >
              <option value="">— Yeni misafir kaydet —</option>
              {misafirler.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} {m.phone ? "· " + m.phone : ""}
                </option>
              ))}
            </select>

            {!seciliMisafir && (
              <div className="grid grid-cols-2 gap-3">
                <Alan etiket="Ad Soyad">
                  <input className={girdiStil} value={yeniMisafir.fullName}
                    onChange={(e) => setYeniMisafir({ ...yeniMisafir, fullName: e.target.value })} />
                </Alan>
                <Alan etiket="TC Kimlik No">
                  <input className={girdiStil} value={yeniMisafir.idNumber}
                    onChange={(e) => setYeniMisafir({ ...yeniMisafir, idNumber: e.target.value })} />
                </Alan>
                <Alan etiket="Telefon">
                  <input className={girdiStil} value={yeniMisafir.phone}
                    onChange={(e) => setYeniMisafir({ ...yeniMisafir, phone: e.target.value })} />
                </Alan>
                <Alan etiket="E-posta">
                  <input className={girdiStil} value={yeniMisafir.email}
                    onChange={(e) => setYeniMisafir({ ...yeniMisafir, email: e.target.value })} />
                </Alan>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Alan etiket="Rezervasyon Kanalı">
              <select className={girdiStil} value={kanal} onChange={(e) => setKanal(e.target.value)}>
                {Object.entries(KANALLAR).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Alan>
            <Alan etiket="Not">
              <input className={girdiStil} value={not} onChange={(e) => setNot(e.target.value)} />
            </Alan>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-xl">
          <div className="text-sm">
            {odaBilgisi ? (
              <>
                <span className="text-gray-500">Toplam konaklama: </span>
                <b className="text-lacivert text-base">{para(toplam)}</b>
                <span className="text-gray-400"> ({gece} gece)</span>
              </>
            ) : (
              <span className="text-gray-400">Oda seçilmedi</span>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onKapat}
              className="border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm hover:bg-gray-100">
              Vazgeç
            </button>
            <button type="submit" disabled={bekliyor}
              className="bg-bakir hover:bg-bakir-acik disabled:opacity-60 text-white rounded-lg px-5 py-2 text-sm font-semibold">
              {bekliyor ? "Kaydediliyor..." : "Rezervasyonu Oluştur"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const girdiStil =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lacivert-acik";

function Alan({ etiket, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{etiket}</span>
      {children}
    </label>
  );
}
