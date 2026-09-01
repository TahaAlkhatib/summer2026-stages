import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Appointment, MedicalRecord, Prescription, Supply, SupplyUsage,
} from '../entities';
import { KayitlarController } from './kayitlar.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalRecord, Prescription, Appointment, Supply, SupplyUsage,
    ]),
  ],
  controllers: [KayitlarController],
})
export class KayitlarModule {}
