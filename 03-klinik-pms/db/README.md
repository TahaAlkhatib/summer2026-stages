# Veritabanı — MongoDB (`clinic_db`)

Bu proje **MongoDB** kullanıyor. İlişkisel veritabanlarındaki gibi bir
`schema.sql` dosyası yok; koleksiyonlar (tablo karşılığı) ilk kayıt
eklendiğinde otomatik oluşur. Alanların tanımı
`apps/api/src/schemas/index.ts` dosyasındaki **Mongoose şemalarında** duruyor.

NestJS tarafında bağlantı `@nestjs/mongoose` ile kuruluyor
(`apps/api/src/app.module.ts`):

```ts
MongooseModule.forRoot(process.env.MONGO_URL || 'mongodb://localhost:27017/clinic_db')
```

## Koleksiyonlar

| Koleksiyon | Şema sınıfı | İçerik |
|------------|-------------|--------|
| `users` | `User` | Personel: admin, resepsiyon, doktor |
| `patients` | `Patient` | Hastalar (TC kimlik no benzersiz, kan grubu, alerjiler) |
| `doctors` | `Doctor` | Doktorlar (branş, muayene ücreti) |
| `appointments` | `Appointment` | Randevular (20 dakikalık slotlar) |
| `medical_records` | `MedicalRecord` | Muayene kayıtları (şikayet, tanı, tedavi notu) |
| `prescriptions` | `Prescription` | Reçete kalemleri (ilaç, doz, gün) |
| `supplies` | `Supply` | Sarf malzeme stoğu |
| `supply_usages` | `SupplyUsage` | Muayenede kullanılan malzemeler |
| `invoices` | `Invoice` | Faturalar (çok seanslı tedavi desteği) |
| `payments` | `Payment` | Seans/taksit bazlı tahsilatlar |

> Mongoose koleksiyon adını normalde model adından üretir
> (`MedicalRecord` → `medicalrecords`). Adların okunur kalması için her
> şemada `@Schema({ collection: '...' })` ile açıkça yazdık.

## İlişkiler

MongoDB'de yabancı anahtar (foreign key) yoktur. Bağ `ObjectId` + `ref`
ile kurulur:

```ts
@Prop({ type: MongoSchema.Types.ObjectId, ref: Patient.name, required: true })
patientId: Types.ObjectId;
```

İlişkili belgeler kontrolörlerde tek tek çekiliyor. Örneğin randevu
listesinde her randevunun hastası ve doktoru ayrı sorguyla okunur:

```ts
const hasta = await this.hastalar.findById(r.patientId);
const doktor = await this.doktorlar.findById(r.doctorId);
```

İlişkisel bir veritabanındaki `JOIN` yerine bu yöntem kullanılıyor. Kayıt
sayısı az olduğu için basit tutuldu; büyük veride `populate()` veya
`$lookup` tercih edilir.

## Kimlik alanı (`_id` → `id`)

MongoDB her kaydı `_id` alanında 24 karakterlik bir **ObjectId** ile tutar.
Web, masaüstü ve mobil uygulamalar `id` alanını beklediği için şemalarda
ortak bir `toJSON` dönüşümü tanımlı:

```ts
export const jsonAyarlari = {
  versionKey: false,
  transform: (belge: any, nesne: any) => {
    nesne.id = nesne._id.toString();
    delete nesne._id;
    return nesne;
  },
};
```

Bu yüzden API cevapları eskisi gibi `id` alanı döndürür — tek fark değerin
sayı değil metin olması. İstemciler `Number(id)` gibi bir çevrim yapmamalı.

> **Dikkat:** Şemada `@Prop({ type: MongoSchema.Types.ObjectId })` yazmak
> gerekiyor. `Types.ObjectId` (BSON sınıfı) yazılırsa alan `Mixed` tipinde
> oluşur ve `find({ doctorId: '65f...' })` gibi metin karşılaştırmaları
> **hiç kayıt bulmaz**.

## Demo verisi

Ayrı bir betik yok: API ilk açılışta `users` koleksiyonu boşsa
`apps/api/src/seed/seed.service.ts` demo verisini yükler — 5 personel,
3 doktor, 8 hasta, 8 sarf malzemesi, 8 randevu (her durumdan örnek),
muayene kayıtları, reçeteler ve 3 fatura.

Sıfırdan başlamak için veritabanını silmek yeterli:

```bash
mongo clinic_db --eval "db.dropDatabase()"     # MongoDB 4.x
# veya
mongosh clinic_db --eval "db.dropDatabase()"   # MongoDB 5+
```

## Tarih saklama notu

Gün sonu raporunda saat değil **gün** önemlidir. `apps/api/src/tarih.ts`
içindeki `gunBasi()` / `gunSonu()` / `gunMetni()` yardımcıları gün
sınırlarını yerel saate göre hesaplar. `toISOString()` kullanılmadı; çünkü
UTC'ye çevirir ve Türkiye UTC+3 olduğu için gece 00:00–03:00 arasında bir
önceki günün raporunu getirirdi.

Tarih aralığı sorguları MongoDB operatörleriyle yazılıyor:

```ts
{ startsAt: { $gte: gunBasi(tarih), $lt: gunSonu(tarih) } }
```

## Neden transaction yok?

MongoDB'de çoklu belge transaction'ı yalnızca **replica set** kurulumunda
çalışır; tek sunucu (standalone) kurulumunda hata verir. Öğrencinin
bilgisayarındaki varsayılan kurulum tek sunucu olduğu için muayene kaydı +
reçete ve fatura + tahsilat akışlarında transaction kullanılmadı. Bunun
yerine kayıtlar **önce doğrulanır**, sonra sırayla yazılır.
