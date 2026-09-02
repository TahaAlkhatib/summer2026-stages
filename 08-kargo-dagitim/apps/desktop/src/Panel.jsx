import { useEffect, useState } from 'react'
import { api } from './api'
import { para, DURUMLAR } from './bicim'

export default function Panel() {
  const [ozet, setOzet] = useState(null)
  const [subeler, setSubeler] = useState([])
  const [kuryeler, setKuryeler] = useState([])
  const [gunluk, setGunluk] = useState([])
  const [hata, setHata] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/branches'),
      api.get('/reports/couriers'),
      api.get('/reports/daily'),
    ])
      .then(([o, s, k, g]) => { setOzet(o); setSubeler(s); setKuryeler(k); setGunluk(g) })
      .catch((e) => setHata(e.message))
  }, [])

  if (hata) return <div className="uyari uyari-hata">{hata}</div>
  if (!ozet) return <div className="bos">Yükleniyor...</div>

  const enYuksek = Math.max(1, ...gunluk.map((g) => Math.max(g.created, g.delivered)))

  return (
    <>
      <div className="sayfa-basligi">
        <div>
          <h2>Genel Durum</h2>
          <p>Toplam {ozet.total} gönderi kayıtlı</p>
        </div>
      </div>

      <div className="kartlar" style={{ marginBottom: 16 }}>
        <div className="ozet-kart">
          <div className="etiket">Bugün alınan</div>
          <div className="deger" style={{ color: 'var(--lacivert)' }}>{ozet.today_created}</div>
          <div className="alt">yeni gönderi</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Bugün teslim</div>
          <div className="deger" style={{ color: 'var(--yesil)' }}>{ozet.today_delivered}</div>
          <div className="alt">tamamlanan</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Şubede bekleyen</div>
          <div className="deger" style={{ color: '#1d4ed8' }}>
            {ozet.counts.olusturuldu + ozet.counts.subede}
          </div>
          <div className="alt">ayrıştırma bekliyor</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Dağıtımda</div>
          <div className="deger" style={{ color: 'var(--turuncu)' }}>{ozet.counts.dagitimda}</div>
          <div className="alt">kuryede</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Kapıda ödeme (bekleyen)</div>
          <div className="deger" style={{ color: 'var(--turuncu)', fontSize: 18 }}>
            {para(ozet.cod_pending)}
          </div>
          <div className="alt">tahsil edilecek</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Tahsil edilen</div>
          <div className="deger" style={{ color: 'var(--yesil)', fontSize: 18 }}>
            {para(ozet.cod_collected)}
          </div>
          <div className="alt">kapıda ödeme</div>
        </div>
      </div>

      <div className="kart">
        <h3>Son 7 Gün</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 150 }}>
          {gunluk.map((g) => (
            <div key={g.date} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end',
                justifyContent: 'center', height: 110 }}>
                <div title={`${g.created} alınan`}
                  style={{ width: 14, background: 'var(--lacivert-acik)', borderRadius: '3px 3px 0 0',
                    height: Math.max(3, (g.created / enYuksek) * 100) + '%' }} />
                <div title={`${g.delivered} teslim`}
                  style={{ width: 14, background: 'var(--yesil)', borderRadius: '3px 3px 0 0',
                    height: Math.max(3, (g.delivered / enYuksek) * 100) + '%' }} />
              </div>
              <div className="kucuk soluk" style={{ marginTop: 5 }}>{g.date.slice(8)}.{g.date.slice(5, 7)}</div>
            </div>
          ))}
        </div>
        <p className="kucuk soluk" style={{ marginTop: 8 }}>
          Lacivert: alınan gönderi · Yeşil: teslim edilen
        </p>
      </div>

      <div className="izgara izgara-2">
        <div className="kart">
          <h3>Şube Durumu</h3>
          <table>
            <thead>
              <tr><th>Şube</th><th className="sag">Bekleyen</th><th className="sag">Dağıtımda</th>
                <th className="sag">Teslim</th><th className="sag">Başarı</th></tr>
            </thead>
            <tbody>
              {subeler.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}<div className="kucuk soluk">{s.code}</div></td>
                  <td className="sag">{s.bekleyen}</td>
                  <td className="sag">{s.dagitimda}</td>
                  <td className="sag">{s.teslim}</td>
                  <td className="sag"><b>%{s.success_rate}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="kart">
          <h3>Kurye Durumu</h3>
          <table>
            <thead>
              <tr><th>Kurye</th><th className="sag">Üzerinde</th><th className="sag">Bugün</th>
                <th className="sag">Tahsilat</th></tr>
            </thead>
            <tbody>
              {kuryeler.map((k) => (
                <tr key={k.id}>
                  <td>{k.full_name}<div className="kucuk soluk">{k.plate} · {k.branch_name}</div></td>
                  <td className="sag">{k.dagitimda}</td>
                  <td className="sag">{k.bugun_teslim}</td>
                  <td className="sag">{para(k.tahsilat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="kart">
        <h3>Durum Dağılımı</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(ozet.counts).map(([anahtar, adet]) => (
            <div key={anahtar} style={{ flex: '1 1 140px', textAlign: 'center',
              border: '1px solid var(--cizgi)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 'bold' }}>{adet}</div>
              <span className={'rozet ' + DURUMLAR[anahtar].sinif}>{DURUMLAR[anahtar].etiket}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
