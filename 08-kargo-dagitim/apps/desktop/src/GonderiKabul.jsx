import { useEffect, useState } from 'react'
import { api } from './api'
import { para, ODEME_TIPLERI } from './bicim'
import { barkodSvg } from './barkod'

// Gönderi kabul ekranı.
// Kaydedilen gönderiler listeye eklenir, sonunda hepsinin etiketi topluca basılır.
export default function GonderiKabul() {
  const [tacirler, setTacirler] = useState([])
  const [hata, setHata] = useState('')
  const [bilgi, setBilgi] = useState('')
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [form, setForm] = useState(bosForm())
  // Bu oturumda kaydedilen gönderiler — toplu etiket basımı için
  const [kesilenler, setKesilenler] = useState([])

  function bosForm() {
    return {
      merchantId: '', receiverName: '', receiverPhone: '', receiverAddress: '',
      receiverDistrict: '', desi: 1, weightKg: '', content: '',
      paymentType: 'gonderici_odemeli', codAmount: 0,
    }
  }

  useEffect(() => {
    api.get('/auth/merchants').then(setTacirler).catch((e) => setHata(e.message))
  }, [])

  async function kaydet(e) {
    e.preventDefault()
    setHata('')
    setBilgi('')
    setKaydediliyor(true)

    try {
      const gonderi = await api.post('/shipments', {
        ...form,
        desi: Number(form.desi),
        weightKg: form.weightKg === '' ? null : Number(form.weightKg),
        codAmount: Number(form.codAmount) || 0,
      })
      setKesilenler([gonderi, ...kesilenler])
      setBilgi(`${gonderi.barcode} oluşturuldu → ${gonderi.dest_branch_name}`)
      // Tacir seçimi kalsın, alıcı bilgileri temizlensin
      setForm({ ...bosForm(), merchantId: form.merchantId })
    } catch (e) {
      setHata(e.message)
    }
    setKaydediliyor(false)
  }

  function alan(ad, deger) {
    setForm({ ...form, [ad]: deger })
  }

  return (
    <>
      <div className="sayfa-basligi yazdirma-gizle">
        <div>
          <h2>Gönderi Kabul</h2>
          <p>Alıcının ilçesine göre dağıtım şubesi otomatik belirlenir</p>
        </div>
        {kesilenler.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="dugme-ikincil" onClick={() => setKesilenler([])}>Listeyi Temizle</button>
            <button className="dugme-turuncu" onClick={() => window.print()}>
              {kesilenler.length} Etiketi Yazdır
            </button>
          </div>
        )}
      </div>

      {hata && <div className="uyari uyari-hata yazdirma-gizle">{hata}</div>}
      {bilgi && <div className="uyari uyari-basari yazdirma-gizle">{bilgi}</div>}

      <div className="izgara izgara-2" style={{ alignItems: 'start' }}>
        <form className="kart yazdirma-gizle" onSubmit={kaydet}>
          <h3>Yeni Gönderi</h3>

          <div className="alan">
            <label>Gönderici (Tacir)</label>
            <select value={form.merchantId} onChange={(e) => alan('merchantId', e.target.value)}>
              <option value="">Seçin</option>
              {tacirler.map((t) => (
                <option key={t.id} value={t.id}>{t.code} — {t.company_name}</option>
              ))}
            </select>
          </div>

          <div className="izgara izgara-2">
            <div className="alan">
              <label>Alıcı Adı</label>
              <input value={form.receiverName} onChange={(e) => alan('receiverName', e.target.value)} />
            </div>
            <div className="alan">
              <label>Alıcı Telefonu</label>
              <input value={form.receiverPhone} onChange={(e) => alan('receiverPhone', e.target.value)}
                placeholder="+90 5.." />
            </div>
          </div>

          <div className="alan">
            <label>Alıcı Adresi</label>
            <textarea rows="2" value={form.receiverAddress}
              onChange={(e) => alan('receiverAddress', e.target.value)} />
          </div>

          <div className="izgara izgara-3">
            <div className="alan">
              <label>İlçe</label>
              <input value={form.receiverDistrict}
                onChange={(e) => alan('receiverDistrict', e.target.value)}
                placeholder="Kadıköy" />
            </div>
            <div className="alan">
              <label>Desi</label>
              <input type="number" min="1" step="0.5" value={form.desi}
                onChange={(e) => alan('desi', e.target.value)} />
            </div>
            <div className="alan">
              <label>Ağırlık (kg)</label>
              <input type="number" min="0" step="0.1" value={form.weightKg}
                onChange={(e) => alan('weightKg', e.target.value)} />
            </div>
          </div>

          <div className="alan">
            <label>İçerik</label>
            <input value={form.content} onChange={(e) => alan('content', e.target.value)}
              placeholder="Giyim, elektronik..." />
          </div>

          <div className="izgara izgara-2">
            <div className="alan">
              <label>Taşıma Ücreti</label>
              <select value={form.paymentType} onChange={(e) => alan('paymentType', e.target.value)}>
                {Object.entries(ODEME_TIPLERI).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="alan">
              <label>Kapıda Ödeme (₺)</label>
              <input type="number" min="0" step="0.01" value={form.codAmount}
                onChange={(e) => alan('codAmount', e.target.value)} />
            </div>
          </div>

          <button className="dugme" style={{ width: '100%' }} disabled={kaydediliyor}>
            {kaydediliyor ? 'Kaydediliyor...' : 'Gönderiyi Kaydet ve Barkod Üret'}
          </button>
        </form>

        <div className="kart">
          <h3 className="yazdirma-gizle">
            Basılacak Etiketler {kesilenler.length > 0 && `(${kesilenler.length})`}
          </h3>

          {kesilenler.length === 0 ? (
            <div className="bos yazdirma-gizle">
              Kaydettiğiniz gönderilerin etiketi burada birikir,
              sonunda topluca yazdırabilirsiniz.
            </div>
          ) : (
            <div className="etiket-alani">
              {kesilenler.map((g) => (
                <KargoEtiketi key={g.id} gonderi={g} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Tek bir kargo etiketi — barkod SVG olarak çiziliyor
function KargoEtiketi({ gonderi }) {
  return (
    <div className="kargo-etiketi">
      <div className="ust">
        <b>HIZLI KARGO</b>
        <span>{gonderi.dest_branch_name}</span>
      </div>

      <div className="barkod" dangerouslySetInnerHTML={{ __html: barkodSvg(gonderi.barcode) }} />
      <div className="barkod-metin">{gonderi.barcode}</div>

      <div className="satir"><b>Alıcı:</b><span>{gonderi.receiver_name}</span></div>
      <div className="satir"><b>Telefon:</b><span>{gonderi.receiver_phone}</span></div>
      <div className="satir"><b>Adres:</b><span>{gonderi.receiver_address}</span></div>
      <div className="satir"><b>İlçe:</b><span>{gonderi.receiver_district}</span></div>
      <div className="satir"><b>Desi:</b><span>{gonderi.desi} · {para(gonderi.shipping_fee)}</span></div>

      {Number(gonderi.cod_amount) > 0 && (
        <div className="kapida">KAPIDA ÖDEME: {para(gonderi.cod_amount)}</div>
      )}
    </div>
  )
}
