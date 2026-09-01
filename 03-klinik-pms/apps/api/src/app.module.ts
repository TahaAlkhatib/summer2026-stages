import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Appointment, Doctor, Invoice, MedicalRecord, Patient, Payment,
  Prescription, Supply, SupplyUsage, User,
} from './entities';

import { AuthModule } from './auth/auth.module';
import { HastalarModule } from './hastalar/hastalar.module';
import { DoktorlarModule } from './doktorlar/doktorlar.module';
import { RandevularModule } from './randevular/randevular.module';
import { KayitlarModule } from './kayitlar/kayitlar.module';
import { MalzemelerModule } from './malzemeler/malzemeler.module';
import { FaturalarModule } from './faturalar/faturalar.module';
import { RaporlarModule } from './raporlar/raporlar.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User, Patient, Doctor, Appointment, MedicalRecord,
        Prescription, Supply, SupplyUsage, Invoice, Payment,
      ],
      // Öğrenci projesi olduğu için migration yerine otomatik şema kullanılıyor
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User, Patient, Doctor, Appointment, MedicalRecord,
      Prescription, Supply, SupplyUsage, Invoice, Payment,
    ]),
    AuthModule,
    HastalarModule,
    DoktorlarModule,
    RandevularModule,
    KayitlarModule,
    MalzemelerModule,
    FaturalarModule,
    RaporlarModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
