import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import {
  Appointment, Doctor, Invoice, MedicalRecord, Patient, Payment,
  Prescription, Supply, User,
} from '../entities';

// Uygulama açılışında veritabanı boşsa Türkçe demo verisini yükler
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private kullanicilar: Repository<User>,
    @InjectRepository(Patient) private hastalar: Repository<Patient>,
    @InjectRepository(Doctor) private doktorlar: Repository<Doctor>,
    @InjectRepository(Appointment) private randevular: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private kayitlar: Repository<MedicalRecord>,
    @InjectRepository(Prescription) private receteler: Repository<Prescription>,
    @InjectRepository(Supply) private malzemeler: Repository<Supply>,
    @InjectRepository(Invoice) private faturalar: Repository<Invoice>,
    @InjectRepository(Payment) private odemeler: Repository<Payment>,
  ) {}

  async onApplicationBootstrap() {
    const mevcut = await this.kullanicilar.count();
    if (mevcut > 0) {
      return;
    }

    console.log('Demo verisi yükleniyor...');
    const sifre = bcrypt.hashSync('123456', 10);

    // Personel
    const personel = await this.kullanicilar.save([
      this.kullanicilar.create({ fullName: 'Ahmet Yılmaz', username: 'admin', passwordHash: sifre, role: 'admin', phone: '+90 532 111 22 33' }),
      this.kullanicilar.create({ fullName: 'Zeynep Kaya', username: 'resepsiyon1', passwordHash: sifre, role: 'resepsiyon', phone: '+90 533 222 33 44' }),
      this.kullanicilar.create({ fullName: 'Dr. Mehmet Aydın', username: 'dr.aydin', passwordHash: sifre, role: 'doktor', phone: '+90 534 333 44 55' }),
      this.kullanicilar.create({ fullName: 'Dr. Ayşe Demir', username: 'dr.demir', passwordHash: sifre, role: 'doktor', phone: '+90 535 444 55 66' }),
      this.kullanicilar.create({ fullName: 'Dr. Canan Şahin', username: 'dr.sahin', passwordHash: sifre, role: 'doktor', phone: '+90 536 555 66 77' }),
    ]);

    // Doktorlar
    const doktorlar = await this.doktorlar.save([
      this.doktorlar.create({ userId: personel[2].id, branch: 'Dahiliye', examinationFee: '900.00' }),
      this.doktorlar.create({ userId: personel[3].id, branch: 'Kardiyoloji', examinationFee: '1400.00' }),
      this.doktorlar.create({ userId: personel[4].id, branch: 'Fizik Tedavi', examinationFee: '750.00' }),
    ]);

    // Hastalar
    const hastalar = await this.hastalar.save([
      this.hastalar.create({ nationalId: '10000000146', fullName: 'Elif Şahin', phone: '+90 535 401 11 21', birthDate: '1992-04-15', gender: 'kadin', bloodType: 'A Rh+', allergies: 'Penisilin', address: 'Bağdat Cad. No:112 / Kadıköy' }),
      this.hastalar.create({ nationalId: '10000000244', fullName: 'Burak Aydın', phone: '+90 536 402 12 22', birthDate: '1985-11-03', gender: 'erkek', bloodType: '0 Rh-', address: 'Barbaros Bulvarı No:38 / Beşiktaş' }),
      this.hastalar.create({ nationalId: '10000000342', fullName: 'Merve Doğan', phone: '+90 537 403 13 23', birthDate: '1998-07-22', gender: 'kadin', bloodType: 'B Rh+', address: 'Çamlıca Mah. 12. Sok No:7 / Üsküdar' }),
      this.hastalar.create({ nationalId: '10000000440', fullName: 'Emre Çelik', phone: '+90 538 404 14 24', birthDate: '1979-01-30', gender: 'erkek', bloodType: 'AB Rh+', allergies: 'Aspirin, polen', address: 'Halaskargazi Cad. No:200 / Şişli' }),
      this.hastalar.create({ nationalId: '10000000548', fullName: 'Ayşe Koç', phone: '+90 539 405 15 25', birthDate: '2001-09-08', gender: 'kadin', bloodType: 'A Rh-', address: 'İncirli Cad. No:45 / Bakırköy' }),
      this.hastalar.create({ nationalId: '10000000646', fullName: 'Kerem Arslan', phone: '+90 505 406 16 26', birthDate: '1990-03-17', gender: 'erkek', bloodType: '0 Rh+', address: 'Nispetiye Cad. No:18 / Beşiktaş' }),
      this.hastalar.create({ nationalId: '10000000744', fullName: 'Selin Yıldız', phone: '+90 506 407 17 27', birthDate: '1995-12-25', gender: 'kadin', bloodType: 'B Rh-', address: 'Moda Cad. No:88 / Kadıköy' }),
      this.hastalar.create({ nationalId: '10000000842', fullName: 'Onur Polat', phone: '+90 507 408 18 28', birthDate: '1972-06-11', gender: 'erkek', bloodType: 'A Rh+', allergies: 'Lateks', address: 'Atatürk Bulvarı No:15 / Ataşehir' }),
    ]);

    // Sarf malzemeleri
    await this.malzemeler.save([
      this.malzemeler.create({ code: 'SM-001', name: 'Enjektör 5 ml', unit: 'adet', unitPrice: '4.50', stockQuantity: 480, minStock: 100 }),
      this.malzemeler.create({ code: 'SM-002', name: 'Steril Eldiven (Çift)', unit: 'adet', unitPrice: '6.00', stockQuantity: 350, minStock: 100 }),
      this.malzemeler.create({ code: 'SM-003', name: 'Gazlı Bez (10x10)', unit: 'adet', unitPrice: '2.20', stockQuantity: 60, minStock: 80 }),
      this.malzemeler.create({ code: 'SM-004', name: 'Antiseptik Solüsyon 500 ml', unit: 'adet', unitPrice: '78.00', stockQuantity: 24, minStock: 10 }),
      this.malzemeler.create({ code: 'SM-005', name: 'EKG Elektrodu', unit: 'adet', unitPrice: '3.80', stockQuantity: 15, minStock: 50 }),
      this.malzemeler.create({ code: 'SM-006', name: 'Serum Fizyolojik 500 ml', unit: 'adet', unitPrice: '32.00', stockQuantity: 90, minStock: 30 }),
      this.malzemeler.create({ code: 'SM-007', name: 'Yara Bandı', unit: 'adet', unitPrice: '1.50', stockQuantity: 600, minStock: 150 }),
      this.malzemeler.create({ code: 'SM-008', name: 'Dil Basma Çubuğu', unit: 'adet', unitPrice: '0.90', stockQuantity: 700, minStock: 200 }),
    ]);

    // Randevular — bugün ve önceki günler
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const durumlar = ['tamamlandi', 'tamamlandi', 'geldi', 'planlandi', 'planlandi', 'iptal', 'gelmedi', 'planlandi'];
    const sikayetler = [
      'Üç gündür devam eden öksürük ve ateş.',
      'Göğüs ağrısı ve çarpıntı şikayeti.',
      'Sırt ve bel ağrısı, hareket kısıtlılığı.',
      'Rutin kontrol muayenesi.',
      'Baş dönmesi ve halsizlik.',
      'Kontrol randevusu.',
      'Boğaz ağrısı.',
      'Tansiyon kontrolü.',
    ];
    const tanilar = [
      'Üst solunum yolu enfeksiyonu',
      'Hipertansiyon',
      'Lumbal bölge kas spazmı',
      '', '', '', '', '',
    ];

    for (let i = 0; i < durumlar.length; i++) {
      const gun = new Date(bugun);
      // İlk üçü geçmiş günlerde, kalanlar bugün ve sonrası
      gun.setDate(gun.getDate() + (i < 3 ? -(3 - i) : 0));
      gun.setHours(9 + i, (i % 3) * 20, 0, 0);

      const randevu = await this.randevular.save(
        this.randevular.create({
          patientId: hastalar[i].id,
          doctorId: doktorlar[i % 3].id,
          startsAt: gun,
          durationMinutes: 20,
          status: durumlar[i],
          note: i === 3 ? 'Aç karnına gelmesi gerekiyor.' : null,
          createdById: personel[1].id,
        }),
      );

      // Tamamlanan randevulara muayene kaydı ve reçete
      if (durumlar[i] === 'tamamlandi') {
        const kayit = await this.kayitlar.save(
          this.kayitlar.create({
            appointmentId: randevu.id,
            patientId: randevu.patientId,
            doctorId: randevu.doctorId,
            complaint: sikayetler[i],
            diagnosis: tanilar[i],
            treatmentNote: 'İlaç tedavisi başlandı, bir hafta sonra kontrol.',
          }),
        );

        await this.receteler.save([
          this.receteler.create({
            recordId: kayit.id,
            medicineName: i === 0 ? 'Amoksisilin 1000 mg' : 'Ramipril 5 mg',
            dosage: i === 0 ? 'Günde 2 kez, 1 tablet' : 'Günde 1 kez, sabah 1 tablet',
            days: i === 0 ? 7 : 30,
          }),
          this.receteler.create({
            recordId: kayit.id,
            medicineName: 'Parasetamol 500 mg',
            dosage: 'Ağrı halinde, günde en fazla 3 tablet',
            days: 5,
          }),
        ]);
      }
    }

    // Çok seanslı fizik tedavi faturası — taksitli tahsilat örneği
    const fizikTedaviFaturasi = await this.faturalar.save(
      this.faturalar.create({
        invoiceNo: 'KF-2026-00001',
        patientId: hastalar[2].id,
        description: 'Fizik tedavi paketi (10 seans)',
        sessionCount: 10,
        totalAmount: '7500.00',
        paidAmount: '0',
      }),
    );

    // İlk 3 seansın ödemesi alınmış
    for (let seans = 1; seans <= 3; seans++) {
      await this.odemeler.save(
        this.odemeler.create({
          invoiceId: fizikTedaviFaturasi.id,
          amount: '750.00',
          method: seans === 1 ? 'kart' : 'nakit',
          sessionNo: seans,
          receivedById: personel[1].id,
        }),
      );
    }
    fizikTedaviFaturasi.paidAmount = '2250.00';
    await this.faturalar.save(fizikTedaviFaturasi);

    // Tek seferlik muayene faturası (ödenmiş)
    const muayeneFaturasi = await this.faturalar.save(
      this.faturalar.create({
        invoiceNo: 'KF-2026-00002',
        patientId: hastalar[0].id,
        description: 'Dahiliye muayenesi',
        sessionCount: 1,
        totalAmount: '900.00',
        paidAmount: '900.00',
      }),
    );
    await this.odemeler.save(
      this.odemeler.create({
        invoiceId: muayeneFaturasi.id,
        amount: '900.00',
        method: 'nakit',
        sessionNo: 1,
        receivedById: personel[1].id,
      }),
    );

    // Ödenmemiş kardiyoloji faturası
    await this.faturalar.save(
      this.faturalar.create({
        invoiceNo: 'KF-2026-00003',
        patientId: hastalar[1].id,
        description: 'Kardiyoloji muayenesi + EKG',
        sessionCount: 1,
        totalAmount: '1700.00',
        paidAmount: '0',
      }),
    );

    console.log('Demo verisi yüklendi.');
  }
}
