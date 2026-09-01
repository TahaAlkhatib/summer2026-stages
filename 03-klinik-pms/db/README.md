# Veritabanı

Şema **TypeORM** tarafından yönetilir; elle çalıştırılacak bir `schema.sql` yoktur.

- Varlık sınıfları: `apps/api/src/entities/index.ts`
- Demo verisi: `apps/api/src/seed/seed.service.ts`

API açılışta `synchronize: true` ile `clinic_db` şemasını oluşturur, veritabanı
boşsa Türkçe demo verisini yükler.

## Tablolar

| Tablo | Açıklama |
|-------|----------|
| `users` | Personel: admin, resepsiyon, doktor |
| `patients` | Hastalar (TC kimlik no benzersiz, kan grubu, alerjiler) |
| `doctors` | Doktorlar (branş, muayene ücreti) |
| `appointments` | Randevular (20 dakikalık slotlar) |
| `medical_records` | Muayene kayıtları (şikayet, tanı, tedavi notu) |
| `prescriptions` | Reçeteler (ilaç, doz, gün) |
| `supplies` | Sarf malzeme stoğu |
| `supply_usages` | Muayenede kullanılan malzemeler |
| `invoices` | Faturalar (çok seanslı tedavi desteği) |
| `payments` | Seans/taksit bazlı tahsilatlar |
