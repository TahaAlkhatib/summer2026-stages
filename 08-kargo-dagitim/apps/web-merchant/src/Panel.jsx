import { useEffect, useState } from 'react'
import { api } from './api'
import { para, DURUMLAR } from './bicim'

export default function Panel() {
  const [ozet, setOzet] = useState(null)
  const [gunluk, setGunluk] = useState([])
  const [hata, setHata] = useState('')

  useEffect(() => {
    Promise.all([api.get('/reports/summary'), api.get('/reports/daily')])
      .then(([o, g]) => { setOzet(o); setGunluk(g) })
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
          <p>Toplam {ozet.total} gönderiniz var</p>
        </div>
      </div>

      <div className="kartlar" style={{ marginBottom: 16 }}>
        <div className="ozet-kart">
          <div className="etiket">Yolda</div>
          <div className="deger" style={{ color: 'var(--turuncu)' }}>
            {ozet.counts.olusturuldu + ozet.counts.subede + ozet.counts.dagitimda}
          </div>
          <div className="alt">şubede + dağıtımda</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Teslim edilen</div>
          <div className="deger" style={{ color: 'var(--yesil)' }}>{ozet.counts.teslim_edildi}</div>
          <div className="alt">tamamlanan</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Sorunlu</div>
          <div className="deger" style={{ color: 'var(--kirmizi)' }}>
            {ozet.counts.teslim_edilemedi + ozet.counts.iade}
          </div>
          <div className="alt">teslim edilemedi / iade</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Bugün gönderilen</div>
          <div className="deger" style={{ color: 'var(--lacivert)' }}>{ozet.today_created}</div>
          <div className="alt">yeni kayıt</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Tahsil edilen (kapıda)</div>
          <div className="deger" style={{ color: 'var(--yesil)', fontSize: 19 }}>
            {para(ozet.cod_collected)}
          </div>
          <div className="alt">hesabınıza aktarılacak</div>
        </div>
        <div className="ozet-kart">
          <div className="etiket">Bekleyen (kapıda)</div>
          <div className="deger" style={{ color: 'var(--turuncu)', fontSize: 19 }}>
            {para(ozet.cod_pending)}
          </div>
          <div className="alt">henüz teslim edilmedi</div>
        </div>
      </div>

      <div className="kart">
        <h3>Son 7 Gün</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 150 }}>
          {gunluk.map((g) => (
            <div key={g.date} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end',
                justifyContent: 'center', height: 110 }}>
                <div title={`${g.created} gönderilen`}
                  style={{ width: 16, background: 'var(--lacivert-acik)',
                    borderRadius: '3px 3px 0 0',
                    height: Math.max(3, (g.created / enYuksek) * 100) + '%' }} />
                <div title={`${g.delivered} teslim`}
                  style={{ width: 16, background: 'var(--yesil)',
                    borderRadius: '3px 3px 0 0',
                    height: Math.max(3, (g.delivered / enYuksek) * 100) + '%' }} />
              </div>
              <div className="kucuk soluk" style={{ marginTop: 5 }}>
                {g.date.slice(8)}.{g.date.slice(5, 7)}
              </div>
            </div>
          ))}
        </div>
        <p className="kucuk soluk" style={{ marginTop: 8 }}>
          Lacivert: gönderdiğiniz · Yeşil: teslim edilen
        </p>
      </div>

      <div className="kart">
        <h3>Durum Dağılımı</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(ozet.counts).map(([anahtar, adet]) => (
            <div key={anahtar} style={{ flex: '1 1 150px', textAlign: 'center',
              border: '1px solid var(--cizgi)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 'bold' }}>{adet}</div>
              <span className={'rozet ' + DURUMLAR[anahtar].sinif}>{DURUMLAR[anahtar].etiket}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
