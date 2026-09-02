import { useEffect, useState } from 'react'
import { api } from './api'
import { para, tarihSaat } from './bicim'

// Kapıda ödeme mutabakatı: tahsil edilen tutar, komisyon ve net ödenecek
export default function Mutabakat() {
  const [satirlar, setSatirlar] = useState([])
  const [gonderiler, setGonderiler] = useState([])
  const [hata, setHata] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/reports/cod-settlement'),
      api.get('/shipments?cod=1'),
    ])
      .then(([m, g]) => { setSatirlar(m); setGonderiler(g) })
      .catch((e) => setHata(e.message))
  }, [])

  if (hata) return <div className="uyari uyari-hata">{hata}</div>

  const benim = satirlar[0]
  const teslimEdilen = gonderiler.filter((g) => g.status === 'teslim_edildi')
  const bekleyen = gonderiler.filter((g) => g.status !== 'teslim_edildi')

  return (
    <>
      <div className="sayfa-basligi">
        <div>
          <h2>Kapıda Ödeme Mutabakatı</h2>
          <p>Tahsil edilen tutarlar ve hesabınıza aktarılacak net bakiye</p>
        </div>
      </div>

      {benim && (
        <div className="kartlar" style={{ marginBottom: 16 }}>
          <div className="ozet-kart">
            <div className="etiket">Tahsilat adedi</div>
            <div className="deger">{benim.tahsilat_adedi}</div>
            <div className="alt">kapıda ödemeli teslimat</div>
          </div>
          <div className="ozet-kart">
            <div className="etiket">Toplam tahsilat</div>
            <div className="deger" style={{ fontSize: 20 }}>{para(benim.toplam)}</div>
            <div className="alt">alıcılardan tahsil edilen</div>
          </div>
          <div className="ozet-kart">
            <div className="etiket">Komisyon (%{benim.cod_commission})</div>
            <div className="deger" style={{ fontSize: 20, color: 'var(--kirmizi)' }}>
              -{para(benim.commission)}
            </div>
            <div className="alt">hizmet bedeli</div>
          </div>
          <div className="ozet-kart">
            <div className="etiket">Hesabınıza aktarılacak</div>
            <div className="deger" style={{ fontSize: 20, color: 'var(--yesil)' }}>
              {para(benim.net_payable)}
            </div>
            <div className="alt">net tutar</div>
          </div>
        </div>
      )}

      <div className="kart">
        <h3>Tahsil Edilen ({teslimEdilen.length})</h3>
        {teslimEdilen.length === 0 ? (
          <div className="bos">Henüz kapıda ödeme tahsilatı yok.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Barkod</th><th>Alıcı</th><th>İlçe</th>
                <th className="sag">Tutar</th><th>Teslim</th></tr>
            </thead>
            <tbody>
              {teslimEdilen.map((g) => (
                <tr key={g.id}>
                  <td><b>{g.barcode}</b></td>
                  <td>{g.receiver_name}</td>
                  <td>{g.receiver_district}</td>
                  <td className="sag"><b>{para(g.cod_amount)}</b></td>
                  <td className="kucuk soluk">{tarihSaat(g.delivered_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="kart">
        <h3>Bekleyen ({bekleyen.length})</h3>
        {bekleyen.length === 0 ? (
          <div className="bos">Bekleyen kapıda ödeme yok.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Barkod</th><th>Alıcı</th><th>İlçe</th>
                <th className="sag">Tutar</th><th>Durum</th></tr>
            </thead>
            <tbody>
              {bekleyen.map((g) => (
                <tr key={g.id}>
                  <td><b>{g.barcode}</b></td>
                  <td>{g.receiver_name}</td>
                  <td>{g.receiver_district}</td>
                  <td className="sag">{para(g.cod_amount)}</td>
                  <td className="kucuk soluk">{g.courier_name ? 'Kuryede' : 'Şubede'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
