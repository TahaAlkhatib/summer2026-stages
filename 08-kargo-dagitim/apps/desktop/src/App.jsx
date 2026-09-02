import { useState } from 'react'
import { oturumBilgisi, oturumKapat } from './api'
import { rolAdi } from './bicim'
import Giris from './Giris'
import Panel from './Panel'
import GonderiKabul from './GonderiKabul'
import Ayristirma from './Ayristirma'
import Irsaliyeler from './Irsaliyeler'
import Gonderiler from './Gonderiler'

const MENU = [
  { anahtar: 'panel', etiket: 'Genel Durum' },
  { anahtar: 'kabul', etiket: 'Gönderi Kabul' },
  { anahtar: 'ayristirma', etiket: 'Şube Ayrıştırma' },
  { anahtar: 'irsaliyeler', etiket: 'İrsaliyeler' },
  { anahtar: 'gonderiler', etiket: 'Gönderi Arama' },
]

export default function App() {
  const [kullanici, setKullanici] = useState(oturumBilgisi())
  const [sayfa, setSayfa] = useState('panel')

  if (!kullanici) {
    return <Giris onGiris={setKullanici} />
  }

  function cikisYap() {
    oturumKapat()
    setKullanici(null)
  }

  return (
    <div className="uygulama">
      <aside className="kenar">
        <div className="kenar-baslik">
          <h1>Kargo Operasyon</h1>
          <span>{kullanici.branchName || 'Merkez'}</span>
        </div>

        <nav>
          {MENU.map((m) => (
            <button
              key={m.anahtar}
              className={sayfa === m.anahtar ? 'aktif' : ''}
              onClick={() => setSayfa(m.anahtar)}
            >
              {m.etiket}
            </button>
          ))}
        </nav>

        <div className="kenar-alt">
          <div className="ad">{kullanici.fullName}</div>
          <div className="rol">{rolAdi(kullanici.role)}</div>
          <button className="dugme-ikincil dugme-kucuk" style={{ width: '100%' }} onClick={cikisYap}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="icerik">
        {sayfa === 'panel' && <Panel />}
        {sayfa === 'kabul' && <GonderiKabul />}
        {sayfa === 'ayristirma' && <Ayristirma />}
        {sayfa === 'irsaliyeler' && <Irsaliyeler />}
        {sayfa === 'gonderiler' && <Gonderiler />}
      </main>
    </div>
  )
}
