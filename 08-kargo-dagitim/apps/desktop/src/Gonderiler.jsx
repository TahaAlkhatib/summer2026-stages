import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { para, tarihSaat, DURUMLAR, ODEME_TIPLERI } from './bicim'

export default function Gonderiler() {
  const [liste, setListe] = useState([])
  const [filtre, setFiltre] = useState({ q: '', status: '' })
  const [detay, setDetay] = useState(null)
  const [hata, setHata] = useState('')
  const [bilgi, setBilgi] = useState('')
  const [yukleniyor, setYukleniyor] = useState(true)

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    try {
      const p = new URLSearchParams()
      if (filtre.q) p.append('q', filtre.q)
      if (filtre.status) p.append('status', filtre.status)
      setListe(await api.get('/shipments?' + p.toString()))
      setHata('')
    } catch (e) { setHata(e.message) }
    setYukleniyor(false)
  }, [filtre])

  useEffect(() => { yukle() }, [yukle])

  async function detayAc(barkod) {
    try {
      setDetay(await api.get('/shipments/barcode/' + barkod))
    } catch (e) { setHata(e.message) }
  }

  // Şubeye kabul — barkod okutulduğunda çağrılır
  async function kabulEt(gonderi) {
    try {
      await api.post(`/shipments/${gonderi.id}/accept`)
      setBilgi(`${gonderi.barcode} şubeye kabul edildi.`)
      await yukle()
    } catch (e) { setHata(e.message) }
  }

  return (
    <>
      <div className="sayfa-basligi">
        <div>
          <h2>Gönderi Arama</h2>
          <p>{liste.length} kayıt</p>
        </div>
      </div>

      {hata && <div className="uyari uyari-hata">{hata}</div>}
      {bilgi && <div className="uyari uyari-basari">{bilgi}</div>}

      <div className="filtreler">
        <div className="alan">
          <label>Barkod / alıcı / telefon</label>
          <input value={filtre.q} style={{ width: 260 }}
            onChange={(e) => setFiltre({ ...filtre, q: e.target.value })}
            onKeyUp={(e) => e.key === 'Enter' && yukle()} />
        </div>
        <div className="alan">
          <label>Durum</label>
          <select value={filtre.status}
            onChange={(e) => setFiltre({ ...filtre, status: e.target.value })}>
            <option value="">Hepsi</option>
            {Object.entries(DURUMLAR).map(([k, v]) => (
              <option key={k} value={k}>{v.etiket}</option>
            ))}
          </select>
        </div>
        <button className="dugme" onClick={yukle}>Ara</button>
      </div>

      <div className="tablo-kutu">
        <table>
          <thead>
            <tr>
              <th>Barkod</th><th>Alıcı</th><th>İlçe / Şube</th><th>Gönderici</th>
              <th className="sag">Ücret</th><th className="sag">Kapıda</th>
              <th>Durum</th><th>Kurye</th><th className="sag"></th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor && <tr><td colSpan="9" className="bos">Yükleniyor...</td></tr>}
            {!yukleniyor && liste.length === 0 &&
              <tr><td colSpan="9" className="bos">Kayıt bulunamadı.</td></tr>}
            {liste.map((g) => (
              <tr key={g.id}>
                <td>
                  <b style={{ cursor: 'pointer', color: 'var(--lacivert-acik)' }}
                    onClick={() => detayAc(g.barcode)}>{g.barcode}</b>
                </td>
                <td>{g.receiver_name}<div className="kucuk soluk">{g.receiver_phone}</div></td>
                <td>{g.receiver_district}<div className="kucuk soluk">{g.dest_branch_name}</div></td>
                <td className="kucuk">{g.company_name}</td>
                <td className="sag">{para(g.shipping_fee)}</td>
                <td className="sag">{Number(g.cod_amount) > 0 ? para(g.cod_amount) : '-'}</td>
                <td>
                  <span className={'rozet ' + DURUMLAR[g.status].sinif}>
                    {DURUMLAR[g.status].etiket}
                  </span>
                </td>
                <td className="kucuk">{g.courier_name || '-'}</td>
                <td className="sag">
                  {g.status === 'olusturuldu' && (
                    <button className="dugme dugme-kucuk" onClick={() => kabulEt(g)}>Şubeye Kabul</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detay && <GonderiDetay veri={detay} onKapat={() => setDetay(null)} />}
    </>
  )
}

function GonderiDetay({ veri, onKapat }) {
  const g = veri.shipment

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: 30, overflowY: 'auto', zIndex: 50,
    }} onClick={(e) => e.target === e.currentTarget && onKapat()}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 760 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cizgi)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--lacivert)' }}>{g.barcode}</h3>
          <button className="dugme-ikincil dugme-kucuk" onClick={onKapat}>Kapat</button>
        </div>

        <div style={{ padding: 20 }}>
          <div className="izgara izgara-3" style={{ marginBottom: 16 }}>
            <div><label>Durum</label>
              <span className={'rozet ' + DURUMLAR[g.status].sinif}>{DURUMLAR[g.status].etiket}</span>
            </div>
            <div><label>Gönderici</label><b>{g.company_name}</b></div>
            <div><label>Kurye</label><b>{g.courier_name || '-'}</b></div>
            <div><label>Alıcı</label><b>{g.receiver_name}</b></div>
            <div><label>Telefon</label><b>{g.receiver_phone}</b></div>
            <div><label>İlçe</label><b>{g.receiver_district}</b></div>
            <div><label>Taşıma ücreti</label><b>{para(g.shipping_fee)}</b></div>
            <div><label>Ödeme</label><b>{ODEME_TIPLERI[g.payment_type]}</b></div>
            <div><label>Kapıda ödeme</label>
              <b>{Number(g.cod_amount) > 0 ? para(g.cod_amount) : '-'}</b></div>
          </div>

          <div className="alan"><label>Adres</label>{g.receiver_address}</div>

          {g.status === 'teslim_edildi' && (
            <div className="uyari uyari-basari">
              {tarihSaat(g.delivered_at)} — <b>{g.delivered_to}</b> teslim aldı.
              {g.delivery_note && ' ' + g.delivery_note}
            </div>
          )}

          <h3 style={{ marginTop: 16 }}>Hareket Geçmişi</h3>
          <table>
            <tbody>
              {veri.events.map((e) => (
                <tr key={e.id}>
                  <td style={{ width: 150 }} className="kucuk">{tarihSaat(e.created_at)}</td>
                  <td style={{ width: 150 }}>
                    <span className={'rozet ' + (DURUMLAR[e.status]?.sinif || 'rozet-gri')}>
                      {e.status_label}
                    </span>
                  </td>
                  <td className="kucuk">{e.description}</td>
                  <td className="kucuk soluk">{e.user_name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {veri.cod && (
            <div className="uyari uyari-bilgi" style={{ marginTop: 14 }}>
              Kapıda ödeme tahsil edildi: <b>{para(veri.cod.amount)}</b> ({veri.cod.method === 'nakit' ? 'Nakit' : 'Kredi Kartı'}) —
              {' '}{tarihSaat(veri.cod.collected_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
