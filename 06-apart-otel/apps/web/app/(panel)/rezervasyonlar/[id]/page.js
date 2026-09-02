"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  para, tarih, tarihSaat, REZERVASYON_DURUMLARI, MASRAF_TURLERI,
  ODEME_YONTEMLERI, KANALLAR,
} from "@/lib/bicim";

export default function RezervasyonDetayi() {
  const { id } = useParams();
  const router = useRouter();

  const [rez, setRez] = useState(null);
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");
  const [islemde, setIslemde] = useState(false);

  const [masraf, setMasraf] = useState({ type: "minibar", description: "", quantity: 1, unitPrice: "" });
  const [odeme, setOdeme] = useState({ amount: "", method: "nakit" });

  const yukle = useCallback(async () => {
    try {
      setRez(await api.get(`/reservations/${id}`));
    } catch (e) {
      setHata(e.message);
    }
  }, [id]);

  useEffect(() => { yukle(); }, [yukle]);

  async function islem(fn, basariMesaji) {
    setHata("");
    setBilgi("");
    setIslemde(true);
    try {
      const cevap = await fn();
      setBilgi(cevap && cevap.message ? cevap.message : basariMesaji);
      await yukle();
    } catch (e) {
      setHata(e.message);
    }
    setIslemde(false);
  }

  if (hata && !rez) {
    return <div className="p-6 text-red-600">{hata}</div>;
  }
  if (!rez) {
    return <div className="p-6 text-gray-400">Yükleniyor...</div>;
  }

  const durum = REZERVASYON_DURUMLARI[rez.status] || { etiket: rez.status, renk: "bg-gray-100" };

  return (
    <div className="p-6 max-w-5xl">
      <Link href="/rezervasyonlar" className="text-sm text-gray-500 hover:text-lacivert">
        ← Rezervasyonlar
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mt-2 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-lacivert">{rez.code}</h1>
          <p className="text-sm text-gray-500">
            {rez.propertyName} · {rez.roomNumber} nolu {rez.roomType}
          </p>
        </div>
        <span className={"px-3 py-1.5 rounded-full text-sm font-medium " + durum.renk}>
          {durum.etiket}
        </span>
      </div>

      {hata && <Uyari renk="red">{hata}</Uyari>}
      {bilgi && <Uyari renk="green">{bilgi}</Uyari>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Kutu baslik="Konaklama Bilgileri">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <Bilgi etiket="Giriş" deger={tarih(rez.checkIn)} />
              <Bilgi etiket="Çıkış" deger={tarih(rez.checkOut)} />
              <Bilgi etiket="Gece" deger={rez.nights} />
              <Bilgi etiket="Gecelik" deger={para(rez.nightlyRate)} />
              <Bilgi etiket="Yetişkin" deger={rez.adults} />
              <Bilgi etiket="Çocuk" deger={rez.children} />
              <Bilgi etiket="Kanal" deger={KANALLAR[rez.channel] || rez.channel} />
              <Bilgi etiket="Not" deger={rez.notes || "-"} />
              {rez.checkedInAt && <Bilgi etiket="Giriş saati" deger={tarihSaat(rez.checkedInAt)} />}
              {rez.checkedOutAt && <Bilgi etiket="Çıkış saati" deger={tarihSaat(rez.checkedOutAt)} />}
            </div>
          </Kutu>

          <Kutu baslik="Misafir">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <Bilgi etiket="Ad Soyad" deger={rez.guest?.fullName} />
              <Bilgi etiket="TC Kimlik" deger={rez.guest?.idNumber || "-"} />
              <Bilgi etiket="Telefon" deger={rez.guest?.phone || "-"} />
              <Bilgi etiket="E-posta" deger={rez.guest?.email || "-"} />
              <Bilgi etiket="Ülke" deger={rez.guest?.country || "-"} />
            </div>
          </Kutu>

          <Kutu baslik="Hesap Dökümü">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left pb-2">Tür</th>
                  <th className="text-left pb-2">Açıklama</th>
                  <th className="text-right pb-2">Adet</th>
                  <th className="text-right pb-2">Birim</th>
                  <th className="text-right pb-2">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rez.charges.map((m) => (
                  <tr key={m._id}>
                    <td className="py-2">{MASRAF_TURLERI[m.type] || m.type}</td>
                    <td className="py-2 text-gray-500">{m.description}</td>
                    <td className="py-2 text-right">{m.quantity}</td>
                    <td className="py-2 text-right">{para(m.unitPrice)}</td>
                    <td className="py-2 text-right font-medium">{para(m.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <form
              className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100"
              onSubmit={(e) => {
                e.preventDefault();
                islem(
                  () => api.post(`/reservations/${id}/charges`, {
                    type: masraf.type,
                    description: masraf.description,
                    quantity: Number(masraf.quantity),
                    unitPrice: Number(masraf.unitPrice),
                  }),
                  "Masraf eklendi."
                ).then(() => setMasraf({ ...masraf, description: "", unitPrice: "" }));
              }}
            >
              <select className={girdi + " w-36"} value={masraf.type}
                onChange={(e) => setMasraf({ ...masraf, type: e.target.value })}>
                {Object.entries(MASRAF_TURLERI).filter(([k]) => k !== "konaklama").map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <input className={girdi + " flex-1 min-w-[140px]"} placeholder="Açıklama"
                value={masraf.description} onChange={(e) => setMasraf({ ...masraf, description: e.target.value })} />
              <input className={girdi + " w-20"} type="number" min="1" placeholder="Adet"
                value={masraf.quantity} onChange={(e) => setMasraf({ ...masraf, quantity: e.target.value })} />
              <input className={girdi + " w-28"} type="number" step="0.01" placeholder="Birim ₺"
                value={masraf.unitPrice} onChange={(e) => setMasraf({ ...masraf, unitPrice: e.target.value })} />
              <button className="bg-lacivert hover:bg-lacivert-acik text-white rounded-lg px-4 py-2 text-sm">
                Masraf Ekle
              </button>
            </form>
          </Kutu>

          <Kutu baslik="Tahsilatlar">
            {rez.payments.length === 0 ? (
              <p className="text-sm text-gray-400">Henüz tahsilat yapılmamış.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {rez.payments.map((o) => (
                    <tr key={o._id}>
                      <td className="py-2">{tarihSaat(o.date)}</td>
                      <td className="py-2 text-gray-500">{ODEME_YONTEMLERI[o.method] || o.method}</td>
                      <td className="py-2 text-right font-medium">{para(o.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <form
              className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100"
              onSubmit={(e) => {
                e.preventDefault();
                islem(
                  () => api.post(`/reservations/${id}/payments`, {
                    amount: Number(odeme.amount),
                    method: odeme.method,
                  }),
                  "Tahsilat kaydedildi."
                ).then(() => setOdeme({ ...odeme, amount: "" }));
              }}
            >
              <input className={girdi + " w-32"} type="number" step="0.01" placeholder="Tutar ₺"
                value={odeme.amount} onChange={(e) => setOdeme({ ...odeme, amount: e.target.value })} />
              <select className={girdi + " w-40"} value={odeme.method}
                onChange={(e) => setOdeme({ ...odeme, method: e.target.value })}>
                {Object.entries(ODEME_YONTEMLERI).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button className="bg-lacivert hover:bg-lacivert-acik text-white rounded-lg px-4 py-2 text-sm">
                Tahsilat Al
              </button>
              {rez.balance > 0 && (
                <button type="button"
                  onClick={() => setOdeme({ ...odeme, amount: String(rez.balance) })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Kalanı yaz ({para(rez.balance)})
                </button>
              )}
            </form>
          </Kutu>
        </div>

        <div className="space-y-5">
          <Kutu baslik="Bakiye">
            <div className="space-y-2 text-sm">
              <Satir etiket="Toplam masraf" deger={para(rez.totalCharges)} />
              <Satir etiket="Tahsil edilen" deger={para(rez.totalPayments)} />
              <div className="border-t border-gray-100 pt-2">
                <Satir
                  etiket="Kalan bakiye"
                  deger={para(rez.balance)}
                  vurgu={rez.balance > 0 ? "text-bakir" : "text-green-700"}
                />
              </div>
            </div>
          </Kutu>

          <Kutu baslik="İşlemler">
            <div className="space-y-2">
              {rez.status === "onaylandi" && (
                <Dugme renk="bg-green-600 hover:bg-green-700" beklet={islemde}
                  onClick={() => islem(() => api.post(`/reservations/${id}/check-in`), "Giriş yapıldı.")}>
                  Giriş Yap (Check-in)
                </Dugme>
              )}

              {rez.status === "giris_yapildi" && (
                <Dugme renk="bg-bakir hover:bg-bakir-acik" beklet={islemde}
                  onClick={() => islem(() => api.post(`/reservations/${id}/check-out`), "Çıkış yapıldı.")}>
                  Çıkış Yap (Check-out)
                </Dugme>
              )}

              {(rez.status === "onaylandi" || rez.status === "giris_yapildi") && (
                <Dugme renk="bg-white border border-red-300 !text-red-600 hover:bg-red-50" beklet={islemde}
                  onClick={() => {
                    if (confirm("Rezervasyon iptal edilsin mi?")) {
                      islem(() => api.put(`/reservations/${id}/cancel`), "Rezervasyon iptal edildi.");
                    }
                  }}>
                  Rezervasyonu İptal Et
                </Dugme>
              )}

              {rez.status === "cikis_yapildi" && (
                <p className="text-sm text-gray-500">
                  Çıkış tamamlandı. Oda için otomatik temizlik görevi açıldı —
                  <Link href="/gorevler" className="text-lacivert-acik hover:underline"> görevlere git</Link>.
                </p>
              )}
            </div>
          </Kutu>
        </div>
      </div>
    </div>
  );
}

const girdi =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lacivert-acik";

function Kutu({ baslik, children }) {
  return (
    <section className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="font-semibold text-lacivert mb-3">{baslik}</h2>
      {children}
    </section>
  );
}

function Bilgi({ etiket, deger }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{etiket}</div>
      <div className="font-medium">{deger}</div>
    </div>
  );
}

function Satir({ etiket, deger, vurgu }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{etiket}</span>
      <span className={"font-semibold " + (vurgu || "")}>{deger}</span>
    </div>
  );
}

function Dugme({ children, renk, onClick, beklet }) {
  return (
    <button
      onClick={onClick}
      disabled={beklet}
      className={"w-full text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60 transition " + renk}
    >
      {children}
    </button>
  );
}

function Uyari({ renk, children }) {
  const stil = renk === "red"
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-green-50 border-green-200 text-green-700";
  return <div className={"border text-sm rounded-lg px-4 py-3 mb-4 " + stil}>{children}</div>;
}
