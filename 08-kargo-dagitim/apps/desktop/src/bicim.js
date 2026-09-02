// Türkçe biçimlendirme yardımcıları

export function para(tutar) {
  const sayi = Number(tutar) || 0
  return sayi.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'
}

export function tarihSaat(deger) {
  if (!deger) return '-'
  const d = new Date(deger)
  if (isNaN(d)) return '-'
  return d.toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function tarih(deger) {
  if (!deger) return '-'
  const d = new Date(deger)
  if (isNaN(d)) return '-'
  return d.toLocaleDateString('tr-TR')
}

export const DURUMLAR = {
  olusturuldu: { etiket: 'Kayıt oluşturuldu', sinif: 'rozet-gri' },
  subede: { etiket: 'Şubede', sinif: 'rozet-mavi' },
  dagitimda: { etiket: 'Dağıtımda', sinif: 'rozet-turuncu' },
  teslim_edildi: { etiket: 'Teslim edildi', sinif: 'rozet-yesil' },
  teslim_edilemedi: { etiket: 'Teslim edilemedi', sinif: 'rozet-kirmizi' },
  iade: { etiket: 'İade', sinif: 'rozet-kirmizi' },
}

export const ODEME_TIPLERI = {
  gonderici_odemeli: 'Gönderici ödemeli',
  alici_odemeli: 'Alıcı ödemeli',
}

export function rolAdi(rol) {
  if (rol === 'admin') return 'Yönetici'
  if (rol === 'operasyon') return 'Operasyon'
  if (rol === 'kurye') return 'Kurye'
  if (rol === 'tacir') return 'Tacir'
  return rol
}
