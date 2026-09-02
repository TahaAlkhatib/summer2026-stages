import { useState } from 'react'
import { api, oturumKaydet } from './api'

export default function Giris({ onGiris }) {
  const [kullaniciAdi, setKullaniciAdi] = useState('')
  const [sifre, setSifre] = useState('')
  const [hata, setHata] = useState('')
  const [bekliyor, setBekliyor] = useState(false)

  async function girisYap(e) {
    e.preventDefault()
    setHata('')
    setBekliyor(true)
    try {
      const cevap = await api.post('/auth/login', {
        username: kullaniciAdi.trim(),
        password: sifre,
      })

      // Bu program şube personeli için
      if (cevap.user.role === 'tacir') {
        setHata('Tacir hesapları için tacir portalını kullanın.')
        setBekliyor(false)
        return
      }

      oturumKaydet(cevap.token, cevap.user)
      onGiris(cevap.user)
    } catch (e) {
      setHata(e.message)
      setBekliyor(false)
    }
  }

  return (
    <div className="giris-zemin">
      <form className="giris-kutu" onSubmit={girisYap}>
        <div className="giris-ust">
          <h1>Kargo Şube Operasyon</h1>
          <p>Gönderi kabul, ayrıştırma ve irsaliye</p>
        </div>
        <div className="giris-govde">
          {hata && <div className="uyari uyari-hata">{hata}</div>}

          <div className="alan">
            <label>Kullanıcı Adı</label>
            <input value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} autoFocus />
          </div>
          <div className="alan">
            <label>Şifre</label>
            <input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} />
          </div>

          <button className="dugme-turuncu" style={{ width: '100%' }} disabled={bekliyor}>
            {bekliyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <p className="kucuk soluk" style={{ textAlign: 'center', marginTop: 16 }}>
            Demo: <b>operasyon / 123456</b>
          </p>
        </div>
      </form>
    </div>
  )
}
