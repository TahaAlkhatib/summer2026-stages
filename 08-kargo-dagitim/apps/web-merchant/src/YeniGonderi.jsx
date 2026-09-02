import { useState } from 'react'
import { api } from './api'
import { para } from './bicim'

// Tacir kendi adına gönderi kaydı açar; barkod ve dağıtım şubesi
// sunucuda otomatik belirlenir.
export default function YeniGonderi({ onKaydedildi }) {
  const [form, setForm] = useState(bosForm())
  const [sonuc, setSonuc] = useState(null)
  const [hata, setHata] = useState('')
  const [kaydediliyor, setKaydediliyor] = useState(false)

  function bosForm() {
    return {
      receiverName: '', receiverPhone: '', receiverAddress: '', receiverDistrict: '',
      desi: 1, weightKg: '', content: '', codAmount: 0,
    }
  }

  function alan(ad, deger) {
    setForm({ ...form, [ad]: deger })
  }

  async function kaydet(e) {
    e.preventDefault()
    setHata('')
    setSonuc(null)
    setKaydediliyor(true)
    try {
      const gonderi = await api.post('/shipments', {
        ...form,
        desi: Number(form.desi),
        weightKg: form.weightKg === '' ? null : Number(form.weightKg),
        codAmount: Number(form.codAmount) || 0,
        paymentType: Number(form.codAmount) > 0 ? 'alici_odemeli' : 'gonderici_odemeli',
      })
      setSonuc(gonderi)
      setForm(bosForm())
    } catch (e) {
      setHata(e.message)
    }
    setKaydediliyor(false)
  }

  return (
    <>
      <div className="sayfa-basligi">
        <div>
          <h2>Yeni Gönderi</h2>
          <p>Barkod ve dağıtım şubesi otomatik belirlenir</p>
        </div>
      </div>

      {hata && <div className="uyari uyari-hata">{hata}</div>}

      {sonuc && (
        <div className="uyari uyari-basari">
          <b>{sonuc.barcode}</b> numaralı gönderi oluşturuldu.
          Dağıtım şubesi: <b>{sonuc.dest_branch_name}</b> ·
          Taşıma ücreti: <b>{para(sonuc.shipping_fee)}</b>
          <div style={{ marginTop: 8 }}>
            <button className="dugme dugme-kucuk" onClick={onKaydedildi}>
              Gönderilerim listesine git
            </button>
          </div>
        </div>
      )}

      <form className="kart" onSubmit={kaydet} style={{ maxWidth: 720 }}>
        <div className="izgara izgara-2">
          <div className="alan">
            <label>Alıcı Adı</label>
            <input value={form.receiverName} onChange={(e) => alan('receiverName', e.target.value)} />
          </div>
          <div className="alan">
            <label>Alıcı Telefonu</label>
            <input value={form.receiverPhone} placeholder="+90 5.."
              onChange={(e) => alan('receiverPhone', e.target.value)} />
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
            <input value={form.receiverDistrict} placeholder="Kadıköy"
              onChange={(e) => alan('receiverDistrict', e.target.value)} />
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

        <div className="izgara izgara-2">
          <div className="alan">
            <label>İçerik</label>
            <input value={form.content} onChange={(e) => alan('content', e.target.value)} />
          </div>
          <div className="alan">
            <label>Kapıda Ödeme (₺)</label>
            <input type="number" min="0" step="0.01" value={form.codAmount}
              onChange={(e) => alan('codAmount', e.target.value)} />
          </div>
        </div>

        <p className="kucuk soluk">
          Kapıda ödeme girerseniz tutar alıcıdan tahsil edilir ve komisyon
          düşülerek hesabınıza aktarılır.
        </p>

        <button className="dugme-turuncu" style={{ width: '100%' }} disabled={kaydediliyor}>
          {kaydediliyor ? 'Kaydediliyor...' : 'Gönderiyi Oluştur'}
        </button>
      </form>
    </>
  )
}
