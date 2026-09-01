"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, paraFormat, tarihSaatFormat, DURUM_ETIKETLERI, ONEM_ETIKETLERI } from "@/lib/api";

export default function IsEmriDetay() {
  const { id } = useParams();
  const router = useRouter();

  const [isEmri, setIsEmri] = useState(null);
  const [parcalar, setParcalar] = useState([]);
  const [teknisyenler, setTeknisyenler] = useState([]);
  const [hata, setHata] = useState("");
  const [basarili, setBasarili] = useState("");

  const [yeniDurum, setYeniDurum] = useState("");
  const [secilenParca, setSecilenParca] = useState("");
  const [parcaAdet, setParcaAdet] = useState("1");
  const [iscilikAciklama, setIscilikAciklama] = useState("");
  const [iscilikSaat, setIscilikSaat] = useState("1");
  const [iscilikUcret, setIscilikUcret] = useState("450");

  function yukle() {
    api.get("/jobcards/" + id)
      .then((d) => { setIsEmri(d); setYeniDurum(d.status); })
      .catch((e) => setHata(e.message));
  }

  useEffect(() => {
    yukle();
    api.get("/parts").then(setParcalar).catch(() => {});
    api.get("/reports/technician-list").then(setTeknisyenler).catch(() => {});
  }, [id]);

  async function calistir(islem, basariMesaji) {
    setHata("");
    setBasarili("");
    try {
      await islem();
      setBasarili(basariMesaji);
      yukle();
      api.get("/parts").then(setParcalar).catch(() => {});
    } catch (e) {
      setHata(e.message);
    }
  }

  if (!isEmri) {
    return hata ? <div className="hata">{hata}</div> : <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <h1>İş Emri — {isEmri.job_no}</h1>

      {hata && <div className="hata">{hata}</div>}
      {basarili && <div className="basarili">{basarili}</div>}

      <div className="satir">
        <div className="kart">
          <h2>Araç</h2>
          <p><strong>Plaka:</strong> {isEmri.vehicle.plate}</p>
          <p><strong>Marka / Model:</strong> {isEmri.vehicle.brand} {isEmri.vehicle.model}</p>
          <p><strong>Yıl:</strong> {isEmri.vehicle.year}</p>
          <p><strong>Renk:</strong> {isEmri.vehicle.color}</p>
          <p><strong>Kilometre:</strong> {isEmri.mileage?.toLocaleString("tr-TR")} km</p>
          <p><strong>Şasi No:</strong> {isEmri.vehicle.chassis_no}</p>
        </div>

        <div className="kart">
          <h2>Müşteri</h2>
          <p><strong>Ad Soyad:</strong> {isEmri.customer.full_name}</p>
          <p><strong>Telefon:</strong> {isEmri.customer.phone}</p>
          <p><strong>E-posta:</strong> {isEmri.customer.email || "-"}</p>
          <hr style={{ border: 0, borderTop: "1px solid #f0f4f8", margin: "14px 0" }} />
          <p><strong>Durum:</strong> <span className={"rozet " + isEmri.status}>{DURUM_ETIKETLERI[isEmri.status]}</span></p>
          <p><strong>Açan:</strong> {isEmri.opened_by_name}</p>
          <p><strong>Teknisyen:</strong> {isEmri.technician_name || "Atanmadı"}</p>
          <p><strong>Açılış:</strong> {tarihSaatFormat(isEmri.opened_at)}</p>
        </div>
      </div>

      <div className="kart">
        <h2>Müşteri Şikayeti</h2>
        <p style={{ margin: 0 }}>{isEmri.complaint_text}</p>
      </div>

      <div className="kart">
        <h2>Arıza Tespitleri (Tablet)</h2>
        {isEmri.inspection_items.length === 0 ? (
          <div className="bos">Henüz arıza tespiti girilmedi.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Tespit</th><th>Açıklama</th><th>Önem</th><th>Fotoğraf</th><th>Tarih</th></tr>
            </thead>
            <tbody>
              {isEmri.inspection_items.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.description || "-"}</td>
                  <td><span className={"onem " + t.severity}>{ONEM_ETIKETLERI[t.severity]}</span></td>
                  <td>
                    {t.photo_path ? (
                      <a href={(process.env.NEXT_PUBLIC_API_URL || "").replace("/api", "") + t.photo_path}
                         target="_blank" rel="noreferrer">Fotoğrafı Aç</a>
                    ) : "-"}
                  </td>
                  <td>{tarihSaatFormat(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="kart">
        <h2>Kullanılan Parçalar</h2>
        <table>
          <thead>
            <tr><th>Kod</th><th>Parça</th><th>Adet</th><th>Birim Fiyat</th><th>Tutar</th><th></th></tr>
          </thead>
          <tbody>
            {isEmri.job_parts.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{p.quantity}</td>
                <td>{paraFormat(p.unit_price)}</td>
                <td>{paraFormat(p.line_total)}</td>
                <td>
                  <button className="gri kucuk"
                    onClick={() => calistir(() => api.del("/jobcards/parts/" + p.id), "Parça depoya iade edildi.")}>
                    İade Et
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isEmri.job_parts.length === 0 && <div className="bos">Henüz parça çekilmedi.</div>}

        <div className="filtreler" style={{ marginTop: 16 }}>
          <div style={{ flex: 3 }}>
            <label>Depodan Parça Çek</label>
            <select value={secilenParca} onChange={(e) => setSecilenParca(e.target.value)}>
              <option value="">Parça seçin</option>
              {parcalar.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name} ({p.stock_quantity} adet) — {paraFormat(p.price)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Adet</label>
            <input type="number" min="1" value={parcaAdet} onChange={(e) => setParcaAdet(e.target.value)} />
          </div>
          <button
            disabled={!secilenParca}
            onClick={() => calistir(
              () => api.post("/jobcards/" + id + "/parts",
                { partId: Number(secilenParca), quantity: Number(parcaAdet) }),
              "Parça iş emrine eklendi ve stoktan düşüldü.")}>
            Ekle
          </button>
        </div>
      </div>

      <div className="kart">
        <h2>İşçilik</h2>
        <table>
          <thead>
            <tr><th>Açıklama</th><th>Saat</th><th>Saat Ücreti</th><th>Tutar</th><th></th></tr>
          </thead>
          <tbody>
            {isEmri.labor_items.map((l) => (
              <tr key={l.id}>
                <td>{l.description}</td>
                <td>{l.hours}</td>
                <td>{paraFormat(l.hourly_rate)}</td>
                <td>{paraFormat(l.line_total)}</td>
                <td>
                  <button className="gri kucuk"
                    onClick={() => calistir(() => api.del("/jobcards/labor/" + l.id), "İşçilik kalemi silindi.")}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isEmri.labor_items.length === 0 && <div className="bos">Henüz işçilik girilmedi.</div>}

        <div className="filtreler" style={{ marginTop: 16 }}>
          <div style={{ flex: 3 }}>
            <label>Açıklama</label>
            <input value={iscilikAciklama} onChange={(e) => setIscilikAciklama(e.target.value)}
                   placeholder="Örn: Fren balatası değişimi" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Saat</label>
            <input type="number" step="0.5" value={iscilikSaat} onChange={(e) => setIscilikSaat(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Saat Ücreti</label>
            <input type="number" value={iscilikUcret} onChange={(e) => setIscilikUcret(e.target.value)} />
          </div>
          <button
            disabled={!iscilikAciklama}
            onClick={() => calistir(
              () => api.post("/jobcards/" + id + "/labor", {
                description: iscilikAciklama,
                hours: Number(iscilikSaat),
                hourlyRate: Number(iscilikUcret),
              }),
              "İşçilik eklendi.").then(() => setIscilikAciklama(""))}>
            Ekle
          </button>
        </div>
      </div>

      <div className="kart">
        <h2>Toplam</h2>
        <table>
          <tbody>
            <tr><td>Parça Toplamı</td><td>{paraFormat(isEmri.parts_total)}</td></tr>
            <tr><td>İşçilik Toplamı</td><td>{paraFormat(isEmri.labor_total)}</td></tr>
          </tbody>
          <tfoot>
            <tr><th>Genel Toplam (KDV hariç)</th><th>{paraFormat(isEmri.grand_total)}</th></tr>
          </tfoot>
        </table>
      </div>

      <div className="satir">
        <div className="kart">
          <h2>Durum ve Teknisyen</h2>
          <label>Yeni Durum</label>
          <select value={yeniDurum} onChange={(e) => setYeniDurum(e.target.value)}>
            {Object.keys(DURUM_ETIKETLERI).map((d) => (
              <option key={d} value={d}>{DURUM_ETIKETLERI[d]}</option>
            ))}
          </select>
          <button onClick={() => calistir(
            () => api.put("/jobcards/" + id + "/status", { status: yeniDurum }),
            "İş emri durumu güncellendi.")}>
            Durumu Kaydet
          </button>

          <div style={{ marginTop: 20 }}>
            <label>Teknisyen Ata</label>
            <select
              value={isEmri.technician_id || ""}
              onChange={(e) => calistir(
                () => api.put("/jobcards/" + id + "/technician/" + e.target.value),
                "Teknisyen atandı.")}>
              <option value="">Seçilmedi</option>
              {teknisyenler.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="kart">
          <h2>Fatura</h2>
          {isEmri.invoice ? (
            <div>
              <p><strong>Fatura No:</strong> {isEmri.invoice.invoice_no}</p>
              <p><strong>Tutar (KDV dahil):</strong> {paraFormat(isEmri.invoice.grand_total)}</p>
              <p><strong>Durum:</strong> {isEmri.invoice.is_paid ? "Ödendi" : "Ödenmedi"}</p>
              <button onClick={() => router.push("/panel/faturalar/" + isEmri.invoice.id)}>
                Faturayı Görüntüle
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: "#7b8794" }}>
                Bu iş emri için henüz fatura kesilmedi. Fatura kesebilmek için iş emri
                &quot;Tamamlandı&quot; durumunda olmalıdır.
              </p>
              <button onClick={() => calistir(
                () => api.post("/invoices", { jobCardId: Number(id), taxRate: 20 }),
                "Fatura kesildi.")}>
                Fatura Kes (KDV %20)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
