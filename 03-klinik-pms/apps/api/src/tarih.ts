// Tarih yardımcıları.
//
// DİKKAT: toISOString() tarihi UTC'ye çevirir. Türkiye UTC+3 olduğu için
// gece 00:00-03:00 arasında bir önceki günü verir ve gün sonu raporu
// yanlış çıkar. Bu yüzden gün sınırlarını YEREL saate göre hesaplıyoruz.

export function gunBasi(deger?: string | Date): Date {
  const d = deger ? new Date(deger) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function gunSonu(deger?: string | Date): Date {
  const d = gunBasi(deger);
  d.setDate(d.getDate() + 1);
  return d;
}

export function gunMetni(deger?: string | Date): string {
  const d = gunBasi(deger);
  const ay = String(d.getMonth() + 1).padStart(2, '0');
  const gun = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${ay}-${gun}`;
}

export function ayBasi(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
