// API'ye giden bütün istekler buradan geçer.

export const API_URL = 'http://localhost:3108/api'

let token = localStorage.getItem('token')
let kullanici = JSON.parse(localStorage.getItem('kullanici') || 'null')

export function oturumBilgisi() {
  return kullanici
}

export function oturumKaydet(yeniToken, yeniKullanici) {
  token = yeniToken
  kullanici = yeniKullanici
  localStorage.setItem('token', yeniToken)
  localStorage.setItem('kullanici', JSON.stringify(yeniKullanici))
}

export function oturumKapat() {
  token = null
  kullanici = null
  localStorage.removeItem('token')
  localStorage.removeItem('kullanici')
}

async function istek(yol, ayarlar = {}) {
  const basliklar = { 'Content-Type': 'application/json' }
  if (token) basliklar.Authorization = 'Bearer ' + token

  let cevap
  try {
    cevap = await fetch(API_URL + yol, { ...ayarlar, headers: basliklar })
  } catch (e) {
    throw new Error('Sunucuya bağlanılamadı. API çalışıyor mu?')
  }

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
    throw new Error((govde && govde.message) || 'Bir hata oluştu.')
  }
  return govde
}

export const api = {
  get: (yol) => istek(yol),
  post: (yol, govde) => istek(yol, { method: 'POST', body: JSON.stringify(govde || {}) }),
}
