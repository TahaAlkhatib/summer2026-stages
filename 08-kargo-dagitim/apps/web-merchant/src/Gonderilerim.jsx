import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { para, tarihSaat, DURUMLAR } from './bicim'

export default function Gonderilerim() {
  const [liste, setListe] = useState([])
  const [filtre, setFiltre] = useState({ q: '', status: '' })
  const [takip, setTakip] = useState(null)
  const [hata, setHata] = useState('')
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

  async function takipAc(barkod) {
    try {
      setTakip(await api.get('/shipments/barcode/' + barkod))
    } catch (e) { setHata(e.message) }
  }

  return (
    <>
      <div className="sayfa-basligi">
        <div>
          <h2>Gönderilerim</h2>
          <p>{liste.length} kayıt</p>
        </div>
      </div>

      {hata && <div className="uyari uyari-hata">{hata}</div>}

      <div className="filtreler">
        <div className="alan">
          <label>Barkod / alıcı ara</label>
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
              <th>Barkod</th><th>Alıcı</th><th>İlçe</th>
              <th className="sag">Desi</th><th className="sag">Ücret</th>
              <th className="sag">Kapıda</th><th>Durum</th><th>Tarih</th><th className="sag"></th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor && <tr><td colSpan="9" className="bos">Yükleniyor...</td></tr>}
            {!yukleniyor && liste.length === 0 &&
              <tr><td colSpan="9" className="bos">Kayıt bulunamadı.</td></tr>}
            {liste.map((g) => (
              <tr key={g.id}>
                <td><b>{g.barcode}</b></td>
                <td>{g.receiver_name}<div className="kucuk soluk">{g.receiver_phone}</div></td>
                <td>{g.receiver_district}</td>
                <td className="sag">{g.desi}</td>
                <td className="sag">{para(g.shipping_fee)}</td>
                <td className="sag">{Number(g.cod_amount) > 0 ? para(g.cod_amount) : '-'}</td>
                <td>
                  <span className={'rozet ' + DURUMLAR[g.status].sinif}>
                    {DURUMLAR[g.status].etiket}
                  </span>
                </td>
                <td className="kucuk soluk">{tarihSaat(g.created_at)}</td>
                <td className="sag">
                  <button className="dugme dugme-kucuk" onClick={() => takipAc(g.barcode)}>Takip</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {takip && <TakipPenceresi veri={takip} onKapat={() => setTakip(null)} />}
    </>
  )
}

function TakipPenceresi({ veri, onKapat }) {
  const g = veri.shipment

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: 30, overflowY: 'auto', zIndex: 50,
    }} onClick={(e) => e.target === e.currentTarget && onKapat()}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 680 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cizgi)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--lacivert)' }}>{g.barcode}</h3>
            <div className="kucuk soluk">{g.receiver_name} · {g.receiver_district}</div>
          </div>
          <button className="dugme-ikincil dugme-kucuk" onClick={onKapat}>Kapat</button>
        </div>

        <div style={{ padding: 20 }}>
          <div className="izgara izgara-3" style={{ marginBottom: 18 }}>
            <div><label>Durum</label>
              <span className={'rozet ' + DURUMLAR[g.status].sinif}>{DURUMLAR[g.status].etiket}</span>
            </div>
            <div><label>Dağıtım şubesi</label><b>{g.dest_branch_name || '-'}</b></div>
            <div><label>Kurye</label><b>{g.courier_name || '-'}</b></div>
          </div>

          {g.status === 'teslim_edildi' && (
            <div className="uyari uyari-basari">
              <b>{g.delivered_to}</b> tarafından teslim alındı — {tarihSaat(g.delivered_at)}
              {veri.cod && <> · Kapıda ödeme tahsil edildi: <b>{para(veri.cod.amount)}</b></>}
            </div>
          )}
          {g.status === 'teslim_edilemedi' && (
            <div className="uyari uyari-hata">
              Teslim edilemedi: {g.delivery_note}
            </div>
          )}

          <h3>Hareket Geçmişi</h3>
          <div className="zaman-cizelgesi">
            {veri.events.map((e) => (
              <div key={e.id}
                className={'zaman-adimi' + (e.status === 'teslim_edildi' ? ' tamam' : '')}>
                <div style={{ fontWeight: 600 }}>{e.status_label}</div>
                <div className="kucuk">{e.description}</div>
                <div className="zaman">
                  {tarihSaat(e.created_at)}
                  {e.branch_name ? ' · ' + e.branch_name : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
