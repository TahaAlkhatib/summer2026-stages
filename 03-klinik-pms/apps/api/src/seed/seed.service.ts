import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import {
  Appointment, AppointmentDocument, Doctor, DoctorDocument,
  Invoice, InvoiceDocument, MedicalRecord, MedicalRecordDocument,
  Patient, PatientDocument, Payment, PaymentDocument,
  Prescription, PrescriptionDocument, Supply, SupplyDocument,
  User, UserDocument,
} from '../schemas';

// Uygulama açılışında veritabanı boşsa Türkçe demo verisini yükler
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private kullanicilar: Model<UserDocument>,
    @InjectModel(Patient.name) private hastalar: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doktorlar: Model<DoctorDocument>,
    @InjectModel(Appointment.name) private randevular: Model<AppointmentDocument>,
    @InjectModel(MedicalRecord.name) private kayitlar: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name) private receteler: Model<PrescriptionDocument>,
    @InjectModel(Supply.name) private malzemeler: Model<SupplyDocument>,
    @InjectModel(Invoice.name) private faturalar: Model<InvoiceDocument>,
    @InjectModel(Payment.name) private odemeler: Model<PaymentDocument>,
  ) {}

  async onApplicationBootstrap() {
    const mevcut = await this.kullanicilar.countDocuments();
    if (mevcut > 0) {
      return;
    }

    console.log('Demo verisi yükleniyor...');
    const sifre = bcrypt.hashSync('123456', 10);

    // Personel
    const personel = await this.kullanicilar.create([
      { fullName: 'Ahmet Yılmaz', username: 'admin', passwordHash: sifre, role: 'admin', phone: '+90 532 111 22 33' },
      { fullName: 'Zeynep Kaya', username: 'resepsiyon1', passwordHash: sifre, role: 'resepsiyon', phone: '+90 533 222 33 44' },
      { fullName: 'Dr. Mehmet Aydın', username: 'dr.aydin', passwordHash: sifre, role: 'doktor', phone: '+90 534 333 44 55' },
      { fullName: 'Dr. Ayşe Demir', username: 'dr.demir', passwordHash: sifre, role: 'doktor', phone: '+90 535 444 55 66' },
      { fullName: 'Dr. Canan Şahin', username: 'dr.sahin', passwordHash: sifre, role: 'doktor', phone: '+90 536 555 66 77' },
    ]);

    // Doktorlar
    const doktorlar = await this.doktorlar.create([
      { userId: personel[2]._id, branch: 'Dahiliye', examinationFee: 900 },
      { userId: personel[3]._id, branch: 'Kardiyoloji', examinationFee: 1400 },
      { userId: personel[4]._id, branch: 'Fizik Tedavi', examinationFee: 750 },
    ]);

    // Hastalar
    const hastalar = await this.hastalar.create([
      { nationalId: '10000000146', fullName: 'Elif Şahin', phone: '+90 535 401 11 21', birthDate: '1992-04-15', gender: 'kadin', bloodType: 'A Rh+', allergies: 'Penisilin', address: 'Bağdat Cad. No:112 / Kadıköy' },
      { nationalId: '10000000244', fullName: 'Burak Aydın', phone: '+90 536 402 12 22', birthDate: '1985-11-03', gender: 'erkek', bloodType: '0 Rh-', address: 'Barbaros Bulvarı No:38 / Beşiktaş' },
      { nationalId: '10000000342', fullName: 'Merve Doğan', phone: '+90 537 403 13 23', birthDate: '1998-07-22', gender: 'kadin', bloodType: 'B Rh+', address: 'Çamlıca Mah. 12. Sok No:7 / Üsküdar' },
      { nationalId: '10000000440', fullName: 'Emre Çelik', phone: '+90 538 404 14 24', birthDate: '1979-01-30', gender: 'erkek', bloodType: 'AB Rh+', allergies: 'Aspirin, polen', address: 'Halaskargazi Cad. No:200 / Şişli' },
      { nationalId: '10000000548', fullName: 'Ayşe Koç', phone: '+90 539 405 15 25', birthDate: '2001-09-08', gender: 'kadin', bloodType: 'A Rh-', address: 'İncirli Cad. No:45 / Bakırköy' },
      { nationalId: '10000000646', fullName: 'Kerem Arslan', phone: '+90 505 406 16 26', birthDate: '1990-03-17', gender: 'erkek', bloodType: '0 Rh+', address: 'Nispetiye Cad. No:18 / Beşiktaş' },
      { nationalId: '10000000744', fullName: 'Selin Yıldız', phone: '+90 506 407 17 27', birthDate: '1995-12-25', gender: 'kadin', bloodType: 'B Rh-', address: 'Moda Cad. No:88 / Kadıköy' },
      { nationalId: '10000000842', fullName: 'Onur Polat', phone: '+90 507 408 18 28', birthDate: '1972-06-11', gender: 'erkek', bloodType: 'A Rh+', allergies: 'Lateks', address: 'Atatürk Bulvarı No:15 / Ataşehir' },
    ]);

    // Sarf malzemeleri
    await this.malzemeler.create([
      { code: 'SM-001', name: 'Enjektör 5 ml', unit: 'adet', unitPrice: 4.5, stockQuantity: 480, minStock: 100 },
      { code: 'SM-002', name: 'Steril Eldiven (Çift)', unit: 'adet', unitPrice: 6, stockQuantity: 350, minStock: 100 },
      { code: 'SM-003', name: 'Gazlı Bez (10x10)', unit: 'adet', unitPrice: 2.2, stockQuantity: 60, minStock: 80 },
      { code: 'SM-004', name: 'Antiseptik Solüsyon 500 ml', unit: 'adet', unitPrice: 78, stockQuantity: 24, minStock: 10 },
      { code: 'SM-005', name: 'EKG Elektrodu', unit: 'adet', unitPrice: 3.8, stockQuantity: 15, minStock: 50 },
      { code: 'SM-006', name: 'Serum Fizyolojik 500 ml', unit: 'adet', unitPrice: 32, stockQuantity: 90, minStock: 30 },
      { code: 'SM-007', name: 'Yara Bandı', unit: 'adet', unitPrice: 1.5, stockQuantity: 600, minStock: 150 },
      { code: 'SM-008', name: 'Dil Basma Çubuğu', unit: 'adet', unitPrice: 0.9, stockQuantity: 700, minStock: 200 },
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

      const randevu = await this.randevular.create({
        patientId: hastalar[i]._id,
        doctorId: doktorlar[i % 3]._id,
        startsAt: gun,
        durationMinutes: 20,
        status: durumlar[i],
        note: i === 3 ? 'Aç karnına gelmesi gerekiyor.' : null,
        createdById: personel[1]._id,
      });

      // Tamamlanan randevulara muayene kaydı ve reçete
      if (durumlar[i] === 'tamamlandi') {
        const kayit = await this.kayitlar.create({
          appointmentId: randevu._id,
          patientId: randevu.patientId,
          doctorId: randevu.doctorId,
          complaint: sikayetler[i],
          diagnosis: tanilar[i],
          treatmentNote: 'İlaç tedavisi başlandı, bir hafta sonra kontrol.',
        });

        await this.receteler.create([
          {
            recordId: kayit._id,
            medicineName: i === 0 ? 'Amoksisilin 1000 mg' : 'Ramipril 5 mg',
            dosage: i === 0 ? 'Günde 2 kez, 1 tablet' : 'Günde 1 kez, sabah 1 tablet',
            days: i === 0 ? 7 : 30,
          },
          {
            recordId: kayit._id,
            medicineName: 'Parasetamol 500 mg',
            dosage: 'Ağrı halinde, günde en fazla 3 tablet',
            days: 5,
          },
        ]);
      }
    }

    // Çok seanslı fizik tedavi faturası — taksitli tahsilat örneği
    const fizikTedaviFaturasi = await this.faturalar.create({
      invoiceNo: 'KF-2026-00001',
      patientId: hastalar[2]._id,
      description: 'Fizik tedavi paketi (10 seans)',
      sessionCount: 10,
      totalAmount: 7500,
      paidAmount: 0,
    });

    // İlk 3 seansın ödemesi alınmış
    for (let seans = 1; seans <= 3; seans++) {
      await this.odemeler.create({
        invoiceId: fizikTedaviFaturasi._id,
        amount: 750,
        method: seans === 1 ? 'kart' : 'nakit',
        sessionNo: seans,
        receivedById: personel[1]._id,
      });
    }
    fizikTedaviFaturasi.paidAmount = 2250;
    await fizikTedaviFaturasi.save();

    // Tek seferlik muayene faturası (ödenmiş)
    const muayeneFaturasi = await this.faturalar.create({
      invoiceNo: 'KF-2026-00002',
      patientId: hastalar[0]._id,
      description: 'Dahiliye muayenesi',
      sessionCount: 1,
      totalAmount: 900,
      paidAmount: 900,
    });
    await this.odemeler.create({
      invoiceId: muayeneFaturasi._id,
      amount: 900,
      method: 'nakit',
      sessionNo: 1,
      receivedById: personel[1]._id,
    });

    // Ödenmemiş kardiyoloji faturası
    await this.faturalar.create({
      invoiceNo: 'KF-2026-00003',
      patientId: hastalar[1]._id,
      description: 'Kardiyoloji muayenesi + EKG',
      sessionCount: 1,
      totalAmount: 1700,
      paidAmount: 0,
    });

    console.log('Demo verisi yüklendi.');
  }
}
