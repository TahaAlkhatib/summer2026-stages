// Ekranda gosterilen degerlerin Turkce bicimlendirilmesi

export function para(tutar) {
  const sayi = Number(tutar) || 0
  return sayi.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'
}

// Buyuk tutarlarda kisa gosterim: 12.500.000 ₺ -> 12,5 Mn ₺
export function paraKisa(tutar) {
  const sayi = Number(tutar) || 0
  if (sayi >= 1000000) {
    return (sayi / 1000000).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' Mn ₺'
  }
  if (sayi >= 1000) {
    return (sayi / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' Bin ₺'
  }
  return para(sayi)
}

// "2026-09-05" -> "05.09.2026"
export function tarih(metin) {
  if (!metin) return '-'
  const p = String(metin).slice(0, 10).split('-')
  if (p.length !== 3) return '-'
  return `${p[2]}.${p[1]}.${p[0]}`
}

// "2026-09-05 14:30" -> "05.09.2026 14:30"
export function tarihSaat(metin) {
  if (!metin) return '-'
  const parcalar = String(metin).replace('T', ' ').split(' ')
  const saat = (parcalar[1] || '').slice(0, 5)
  return tarih(parcalar[0]) + (saat ? ' ' + saat : '')
}

export function saat(metin) {
  if (!metin) return ''
  const parcalar = String(metin).replace('T', ' ').split(' ')
  return (parcalar[1] || '').slice(0, 5)
}

export const ISLEM_TIPLERI = { satilik: 'Satılık', kiralik: 'Kiralık' }

export const GAYRIMENKUL_TIPLERI = {
  daire: 'Daire', villa: 'Villa', isyeri: 'İşyeri', arsa: 'Arsa',
}

export const PORTFOY_DURUMLARI = {
  aktif: { etiket: 'Aktif', sinif: 'rozet-yesil' },
  rezerve: { etiket: 'Rezerve', sinif: 'rozet-sari' },
  satildi: { etiket: 'Satıldı', sinif: 'rozet-gri' },
  kiralandi: { etiket: 'Kiralandı', sinif: 'rozet-mavi' },
  pasif: { etiket: 'Pasif', sinif: 'rozet-gri' },
}

export const RANDEVU_DURUMLARI = {
  planlandi: { etiket: 'Planlandı', sinif: 'rozet-mavi' },
  gerceklesti: { etiket: 'Gerçekleşti', sinif: 'rozet-yesil' },
  iptal: { etiket: 'İptal', sinif: 'rozet-kirmizi' },
}

export const ILGI_SEVIYELERI = {
  dusuk: { etiket: 'Düşük ilgi', sinif: 'rozet-gri' },
  orta: { etiket: 'Orta ilgi', sinif: 'rozet-sari' },
  yuksek: { etiket: 'Yüksek ilgi', sinif: 'rozet-yesil' },
}

export const SOZLESME_TIPLERI = { satis: 'Satış', kira: 'Kira' }

export const SOZLESME_DURUMLARI = {
  aktif: { etiket: 'Aktif', sinif: 'rozet-yesil' },
  bitti: { etiket: 'Bitti', sinif: 'rozet-gri' },
  feshedildi: { etiket: 'Feshedildi', sinif: 'rozet-kirmizi' },
}

export const TAKSIT_DURUMLARI = {
  bekliyor: { etiket: 'Bekliyor', sinif: 'rozet-sari' },
  odendi: { etiket: 'Ödendi', sinif: 'rozet-yesil' },
  gecikti: { etiket: 'Gecikti', sinif: 'rozet-kirmizi' },
  iptal: { etiket: 'İptal', sinif: 'rozet-gri' },
}

export const ODEME_YONTEMLERI = {
  nakit: 'Nakit', havale: 'Havale / EFT', kredi_karti: 'Kredi Kartı',
}

export const EVRAK_TURLERI = {
  tapu: 'Tapu', kimlik: 'Kimlik', sozlesme: 'Sözleşme',
  yoklama: 'Yoklama Tutanağı', dask: 'DASK Poliçesi', diger: 'Diğer',
}

export const MUSTERI_KAYNAKLARI = {
  telefon: 'Telefon', web: 'İnternet', tabela: 'Tabela', tavsiye: 'Tavsiye',
}

export function rolAdi(rol) {
  if (rol === 'admin') return 'Yönetici'
  if (rol === 'danisman') return 'Danışman'
  return rol
}

// Dosya boyutu: 193 -> "193 B", 20480 -> "20 KB"
export function dosyaBoyutu(bayt) {
  const n = Number(bayt) || 0
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB'
  return (n / 1024 / 1024).toFixed(1) + ' MB'
}

// Bugünün tarihi — toISOString() UTC'ye çevirdiği için elle üretiyoruz
export function bugun() {
  const d = new Date()
  const ay = String(d.getMonth() + 1).padStart(2, '0')
  const gun = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${ay}-${gun}`
}
