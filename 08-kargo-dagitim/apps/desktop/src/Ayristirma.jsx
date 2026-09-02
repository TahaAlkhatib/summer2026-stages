import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { para, DURUMLAR } from './bicim'

// Şube ayrıştırma: bekleyen gönderiler dağıtım şubesine göre gruplanır.
// Buradan ya karşı şubeye sevk irsaliyesi ya da kuryeye dağıtım irsaliyesi kesilir.
export default function Ayristirma() {
  const [gruplar, setGruplar] = useState([])
  const [seciliSube, setSeciliSube] = useState(null)
  const [gonderiler, setGonderiler] = useState([])
  const [secilenler, setSecilenler] = useState([])
  const [kuryeler, setKuryeler] = useState([])
  const [subeler, setSubeler] = useState([])
  const [hata, setHata] = useState('')
  const [bilgi, setBilgi] = useState('')
  const [islemde, setIslemde] = useState(false)

  const [irsaliyeTipi, setIrsaliyeTipi] = useState('kurye_dagitim')
  const [kuryeId, setKuryeId] = useState('')
  const [hedefSubeId, setHedefSubeId] = useState('')

  const yukle = useCallback(async () => {
    try {
      setGruplar(await api.get('/shipments/sorting/summary'))
      setHata('')
    } catch (e) { setHata(e.message) }
  }, [])

  useEffect(() => {
    yukle()
    api.get('/auth/couriers').then(setKuryeler).catch(() => {})
    api.get('/auth/branches').then(setSubeler).catch(() => {})
  }, [yukle])

  async function subeSec(sube) {
    setSeciliSube(sube)
    setSecilenler([])
    setBilgi('')
    try {
      const liste = await api.get(`/shipments?destBranchId=${sube.branch_id}`)
      // Sadece henüz dağıtıma çıkmamış olanlar
      setGonderiler(liste.filter((g) => ['olusturuldu', 'subede'].includes(g.status)))
    } catch (e) { setHata(e.message) }
  }

  function secimDegistir(id) {
    setSecilenler(secilenler.includes(id)
      ? secilenler.filter((x) => x !== id)
      : [...secilenler, id])
  }

  function hepsiniSec() {
    setSecilenler(secilenler.length === gonderiler.length ? [] : gonderiler.map((g) => g.id))
  }

  async function irsaliyeOlustur() {
    if (secilenler.length === 0) {
      setHata('En az bir gönderi seçin.')
      return
    }
    setIslemde(true)
    setHata('')
    try {
      const irsaliye = await api.post('/manifests', {
        type: irsaliyeTipi,
        courierId: irsaliyeTipi === 'kurye_dagitim' ? Number(kuryeId) : null,
        destBranchId: irsaliyeTipi === 'sube_sevk' ? Number(hedefSubeId) : null,
        shipmentIds: secilenler,
      })
      setBilgi(`${irsaliye.code} irsaliyesi oluşturuldu (${irsaliye.item_count} gönderi). ` +
        'İrsaliyeler ekranından yazdırabilirsiniz.')
      setSecilenler([])
      await yukle()
      if (seciliSube) await subeSec(seciliSube)
    } catch (e) { setHata(e.message) }
    setIslemde(false)
  }

  return (
    <>
      <div className="sayfa-basligi">
        <div>
          <h2>Şube Ayrıştırma</h2>
          <p>Bekleyen gönderiler dağıtım şubesine göre gruplanır</p>
        </div>
        <button className="dugme-ikincil" onClick={yukle}>Yenile</button>
      </div>

      {hata && <div className="uyari uyari-hata">{hata}</div>}
      {bilgi && <div className="uyari uyari-basari">{bilgi}</div>}

      <div className="kartlar" style={{ marginBottom: 16 }}>
        {gruplar.map((g) => (
          <div key={g.branch_id} className="ozet-kart"
            style={{
              cursor: 'pointer',
              border: seciliSube?.branch_id === g.branch_id
                ? '2px solid var(--turuncu)' : '2px solid transparent',
            }}
            onClick={() => subeSec(g)}>
            <div className="etiket">{g.code}</div>
            <div style={{ fontWeight: 600 }}>{g.name}</div>
            <div className="deger" style={{ color: g.adet > 0 ? 'var(--lacivert)' : '#9ca3af' }}>
              {g.adet}
            </div>
            <div className="alt">
              {Number(g.cod_toplam) > 0 ? 'Kapıda ödeme: ' + para(g.cod_toplam) : 'gönderi bekliyor'}
            </div>
          </div>
        ))}
      </div>

      {seciliSube && (
        <div className="kart">
          <h3>
            {seciliSube.name} — Bekleyen Gönderiler ({gonderiler.length})
            <span className="kucuk soluk" style={{ fontWeight: 'normal', marginLeft: 8 }}>
              hizmet ilçeleri: {seciliSube.districts}
            </span>
          </h3>

          {gonderiler.length === 0 ? (
            <div className="bos">Bu şube için bekleyen gönderi yok.</div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 34 }}>
                      <input type="checkbox" style={{ width: 'auto' }}
                        checked={secilenler.length === gonderiler.length}
                        onChange={hepsiniSec} />
                    </th>
                    <th>Barkod</th>
                    <th>Alıcı</th>
                    <th>İlçe</th>
                    <th>Gönderici</th>
                    <th className="sag">Desi</th>
                    <th className="sag">Kapıda Ödeme</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {gonderiler.map((g) => (
                    <tr key={g.id}>
                      <td>
                        <input type="checkbox" style={{ width: 'auto' }}
                          checked={secilenler.includes(g.id)}
                          onChange={() => secimDegistir(g.id)} />
                      </td>
                      <td><b>{g.barcode}</b></td>
                      <td>{g.receiver_name}<div className="kucuk soluk">{g.receiver_phone}</div></td>
                      <td>{g.receiver_district}</td>
                      <td className="kucuk">{g.company_name}</td>
                      <td className="sag">{g.desi}</td>
                      <td className="sag">
                        {Number(g.cod_amount) > 0 ? para(g.cod_amount) : '-'}
                      </td>
                      <td>
                        <span className={'rozet ' + DURUMLAR[g.status].sinif}>
                          {DURUMLAR[g.status].etiket}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end',
                marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--cizgi)' }}>
                <div className="alan" style={{ marginBottom: 0 }}>
                  <label>İrsaliye Tipi</label>
                  <select value={irsaliyeTipi} onChange={(e) => setIrsaliyeTipi(e.target.value)}>
                    <option value="kurye_dagitim">Kuryeye Dağıtım</option>
                    <option value="sube_sevk">Şubeye Sevk</option>
                  </select>
                </div>

                {irsaliyeTipi === 'kurye_dagitim' ? (
                  <div className="alan" style={{ marginBottom: 0 }}>
                    <label>Kurye</label>
                    <select value={kuryeId} onChange={(e) => setKuryeId(e.target.value)}>
                      <option value="">Seçin</option>
                      {kuryeler.map((k) => (
                        <option key={k.id} value={k.id}>{k.full_name} — {k.plate}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="alan" style={{ marginBottom: 0 }}>
                    <label>Varış Şubesi</label>
                    <select value={hedefSubeId} onChange={(e) => setHedefSubeId(e.target.value)}>
                      <option value="">Seçin</option>
                      {subeler.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ flex: 1 }} />
                <div className="kucuk soluk">{secilenler.length} gönderi seçildi</div>
                <button className="dugme-turuncu" disabled={islemde} onClick={irsaliyeOlustur}>
                  {islemde ? 'Oluşturuluyor...' : 'İrsaliye Oluştur'}
                </button>
              </div>

              {irsaliyeTipi === 'kurye_dagitim' && (
                <p className="kucuk soluk" style={{ marginTop: 8 }}>
                  Kuryeye zimmetlenen her gönderi için 6 haneli teslimat kodu üretilir.
                  Gerçek sistemde bu kod alıcıya SMS ile gider.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
