// API'ye giden butun istekler buradan gecer.
// Token tarayicinin localStorage'inda saklanir.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8107/api'

export function tokenAl() {
  return localStorage.getItem('token')
}

export function kullaniciAl() {
  const metin = localStorage.getItem('kullanici')
  return metin ? JSON.parse(metin) : null
}

export function oturumKaydet(token, kullanici) {
  localStorage.setItem('token', token)
  localStorage.setItem('kullanici', JSON.stringify(kullanici))
}

export function oturumKapat() {
  localStorage.removeItem('token')
  localStorage.removeItem('kullanici')
}

async function istek(yol, ayarlar = {}) {
  const basliklar = { Accept: 'application/json', ...(ayarlar.headers || {}) }
  const token = tokenAl()
  if (token) basliklar.Authorization = 'Bearer ' + token

  // FormData gonderirken Content-Type'i tarayici kendisi koymali
  if (ayarlar.body && !(ayarlar.body instanceof FormData)) {
    basliklar['Content-Type'] = 'application/json'
  }

  let cevap
  try {
    cevap = await fetch(API_URL + yol, { ...ayarlar, headers: basliklar })
  } catch (e) {
    throw new Error('Sunucuya bağlanılamadı. API çalışıyor mu?')
  }

  if (cevap.status === 204) return null

  let govde = null
  const metin = await cevap.text()
  if (metin) {
    try {
      govde = JSON.parse(metin)
    } catch (e) {
      throw new Error('Sunucudan beklenmeyen bir cevap geldi.')
    }
  }

  if (!cevap.ok) {
    if (cevap.status === 401) {
      oturumKapat()
      window.location.href = '/giris'
    }
    // Laravel doğrulama hatalarında ilk alanın mesajını gösteriyoruz
    if (govde && govde.errors) {
      const ilk = Object.values(govde.errors)[0]
      throw new Error(Array.isArray(ilk) ? ilk[0] : govde.message)
    }
    throw new Error((govde && govde.message) || 'Bir hata oluştu.')
  }

  return govde
}

export const api = {
  get: (yol) => istek(yol),
  post: (yol, govde) => istek(yol, { method: 'POST', body: JSON.stringify(govde || {}) }),
  put: (yol, govde) => istek(yol, { method: 'PUT', body: JSON.stringify(govde || {}) }),
  del: (yol) => istek(yol, { method: 'DELETE' }),
  yukle: (yol, formVerisi) => istek(yol, { method: 'POST', body: formVerisi }),
}

// Evrak indirme — token gerektigi icin blob olarak alip kaydediyoruz
export async function evrakIndir(id, dosyaAdi) {
  const cevap = await fetch(`${API_URL}/documents/${id}/download`, {
    headers: { Authorization: 'Bearer ' + tokenAl() },
  })
  if (!cevap.ok) throw new Error('Dosya indirilemedi.')

  const blob = await cevap.blob()
  const adres = URL.createObjectURL(blob)
  const bag = document.createElement('a')
  bag.href = adres
  bag.download = dosyaAdi
  bag.click()
  URL.revokeObjectURL(adres)
}
