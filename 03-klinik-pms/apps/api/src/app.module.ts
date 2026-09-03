import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Appointment, AppointmentSchema, Doctor, DoctorSchema, Invoice, InvoiceSchema,
  MedicalRecord, MedicalRecordSchema, Patient, PatientSchema, Payment, PaymentSchema,
  Prescription, PrescriptionSchema, Supply, SupplySchema, SupplyUsage, SupplyUsageSchema,
  User, UserSchema,
} from './schemas';

import { AuthModule } from './auth/auth.module';
import { HastalarModule } from './hastalar/hastalar.module';
import { DoktorlarModule } from './doktorlar/doktorlar.module';
import { RandevularModule } from './randevular/randevular.module';
import { KayitlarModule } from './kayitlar/kayitlar.module';
import { MalzemelerModule } from './malzemeler/malzemeler.module';
import { FaturalarModule } from './faturalar/faturalar.module';
import { RaporlarModule } from './raporlar/raporlar.module';
import { HastaPortalModule } from './hasta-portal/hasta-portal.module';
import { SeedService } from './seed/seed.service';

// Bütün modellerin listesi — hem kök modül hem seed servisi kullanıyor
export const TUM_MODELLER = [
  { name: User.name, schema: UserSchema },
  { name: Patient.name, schema: PatientSchema },
  { name: Doctor.name, schema: DoctorSchema },
  { name: Appointment.name, schema: AppointmentSchema },
  { name: MedicalRecord.name, schema: MedicalRecordSchema },
  { name: Prescription.name, schema: PrescriptionSchema },
  { name: Supply.name, schema: SupplySchema },
  { name: SupplyUsage.name, schema: SupplyUsageSchema },
  { name: Invoice.name, schema: InvoiceSchema },
  { name: Payment.name, schema: PaymentSchema },
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongoDB'de tablo/şema oluşturmaya gerek yok; koleksiyonlar
    // ilk kayıtta otomatik oluşur.
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://localhost:27017/clinic_db',
    ),
    MongooseModule.forFeature(TUM_MODELLER),
    AuthModule,
    HastalarModule,
    DoktorlarModule,
    RandevularModule,
    KayitlarModule,
    MalzemelerModule,
    FaturalarModule,
    RaporlarModule,
    HastaPortalModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
