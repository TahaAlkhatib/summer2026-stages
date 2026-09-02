"use client";

import { useCallback, useEffect, useState } from "react";
import { api, kullaniciAl } from "@/lib/api";
import { tarihSaat, GOREV_DURUMLARI } from "@/lib/bicim";

const SUTUNLAR = [
  { durum: "bekliyor", baslik: "Bekliyor" },
  { durum: "basladi", baslik: "Devam Ediyor" },
  { durum: "tamamlandi", baslik: "Tamamlandı" },
];

export default function GorevlerSayfasi() {
  const [gorevler, setGorevler] = useState([]);
  const [tur, setTur] = useState("");
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kullanici, setKullanici] = useState(null);

  useEffect(() => { setKullanici(kullaniciAl()); }, []);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const yol = tur ? `/tasks?type=${tur}` : "/tasks";
      setGorevler(await api.get(yol));
      setHata("");
    } catch (e) {
      setHata(e.message);
    }
    setYukleniyor(false);
  }, [tur]);

  useEffect(() => { yukle(); }, [yukle]);

  async function baslat(g) {
    try {
      await api.put(`/tasks/${g.id}/start`);
      setBilgi(`${g.roomNumber} nolu oda için iş başlatıldı.`);
      yukle();
    } catch (e) { setHata(e.message); }
  }

  async function tamamla(g) {
    const not = prompt("Tamamlama notu (isteğe bağlı):", "");
    if (not === null) return;
    try {
      const cevap = await api.put(`/tasks/${g.id}/complete`, { note: not });
      setBilgi(cevap.message);
      yukle();
    } catch (e) { setHata(e.message); }
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-lacivert">Temizlik &amp; Bakım Görevleri</h1>
          <p className="text-sm text-gray-500">
            Çıkış yapılan odalar için görev <b>otomatik</b> açılır. Görev tamamlanınca oda satışa döner.
          </p>
        </div>

        <select value={tur} onChange={(e) => setTur(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Tüm görevler</option>
          <option value="temizlik">Temizlik</option>
          <option value="bakim">Bakım</option>
        </select>
      </div>

      {hata && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{hata}</div>}
      {bilgi && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{bilgi}</div>}

      {yukleniyor ? (
        <div className="text-gray-400">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUTUNLAR.map((s) => {
            const sutunGorevleri = gorevler.filter((g) => g.status === s.durum);
            return (
              <div key={s.durum} className="bg-white rounded-xl shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-lacivert">{s.baslik}</h2>
                  <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                    {sutunGorevleri.length}
                  </span>
                </div>

                <div className="p-3 space-y-3 min-h-[120px]">
                  {sutunGorevleri.length === 0 && (
                    <p className="text-sm text-gray-300 text-center py-6">Görev yok</p>
                  )}

                  {sutunGorevleri.map((g) => (
                    <div key={g.id}
                      className={"border rounded-lg p-3 " +
                        (g.priority === "acil" ? "border-red-300 bg-red-50/50" : "border-gray-200")}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm text-lacivert">
                            {g.roomNumber}
                            <span className="font-normal text-gray-400 text-xs"> · {g.propertyName}</span>
                          </div>
                          <div className="text-xs text-gray-500">{g.roomType}</div>
                        </div>
                        <span className={"text-[10px] px-2 py-0.5 rounded-full font-medium " +
                          (g.type === "bakim" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700")}>
                          {g.type === "bakim" ? "Bakım" : "Temizlik"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mt-2">{g.description}</p>

                      <div className="text-[11px] text-gray-400 mt-2 space-y-0.5">
                        <div>Açılış: {tarihSaat(g.createdAt)} {g.source === "cikis" && "· çıkış sonrası otomatik"}</div>
                        {g.assignedName && <div>Görevli: {g.assignedName}</div>}
                        {g.completedAt && <div>Bitiş: {tarihSaat(g.completedAt)}</div>}
                        {g.completionNote && <div className="text-gray-500 italic">"{g.completionNote}"</div>}
                      </div>

                      {g.priority === "acil" && (
                        <div className="text-[11px] text-red-600 font-semibold mt-1">ACİL</div>
                      )}

                      <div className="flex gap-2 mt-3">
                        {g.status === "bekliyor" && (
                          <button onClick={() => baslat(g)}
                            className="flex-1 bg-lacivert hover:bg-lacivert-acik text-white rounded-lg py-1.5 text-xs font-semibold">
                            Başla
                          </button>
                        )}
                        {g.status === "basladi" && (
                          <button onClick={() => tamamla(g)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-1.5 text-xs font-semibold">
                            Tamamla
                          </button>
                        )}
                        {g.status === "tamamlandi" && (
                          <span className={"text-xs px-2 py-1 rounded " + GOREV_DURUMLARI.tamamlandi.renk}>
                            Tamamlandı
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {kullanici && (kullanici.role === "temizlik" || kullanici.role === "teknik") && (
        <p className="text-xs text-gray-400 mt-4">
          Sahada telefondan çalışıyorsanız mobil uygulamayı kullanabilirsiniz.
        </p>
      )}
    </div>
  );
}
