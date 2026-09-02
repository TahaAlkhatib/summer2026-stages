import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Appointment, Invoice, MedicalRecord, Patient, Payment,
} from '../entities';
import { HastaPortalController } from './hasta-portal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Appointment, MedicalRecord, Invoice, Payment]),
  ],
  controllers: [HastaPortalController],
})
export class HastaPortalModule {}
