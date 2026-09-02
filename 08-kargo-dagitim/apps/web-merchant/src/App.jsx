import { useState } from 'react'
import { oturumBilgisi, oturumKapat } from './api'
import Giris from './Giris'
import Panel from './Panel'
import Gonderilerim from './Gonderilerim'
import YeniGonderi from './YeniGonderi'
import Mutabakat from './Mutabakat'

const MENU = [
  { anahtar: 'panel', etiket: 'Genel Durum' },
  { anahtar: 'gonderiler', etiket: 'Gönderilerim' },
  { anahtar: 'yeni', etiket: 'Yeni Gönderi' },
  { anahtar: 'mutabakat', etiket: 'Kapıda Ödeme' },
]

export default function App() {
  const [kullanici, setKullanici] = useState(oturumBilgisi())
  const [sayfa, setSayfa] = useState('panel')

  if (!kullanici) return <Giris onGiris={setKullanici} />

  function cikisYap() {
    oturumKapat()
    setKullanici(null)
  }

  return (
    <>
      <header className="ust-serit">
        <div className="marka">
          Hızlı Kargo
          <span>Tacir Portalı</span>
        </div>

        <nav>
          {MENU.map((m) => (
            <button key={m.anahtar}
              className={sayfa === m.anahtar ? 'aktif' : ''}
              onClick={() => setSayfa(m.anahtar)}>
              {m.etiket}
            </button>
          ))}
        </nav>

        <div className="kullanici">
          {kullanici.merchantName}
          <small>{kullanici.fullName}</small>
        </div>
        <button className="dugme-ikincil dugme-kucuk" onClick={cikisYap}>Çıkış</button>
      </header>

      <main className="icerik">
        {sayfa === 'panel' && <Panel />}
        {sayfa === 'gonderiler' && <Gonderilerim />}
        {sayfa === 'yeni' && <YeniGonderi onKaydedildi={() => setSayfa('gonderiler')} />}
        {sayfa === 'mutabakat' && <Mutabakat />}
      </main>
    </>
  )
}
