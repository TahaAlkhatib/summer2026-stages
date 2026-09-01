import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, Invoice, Patient, Payment, Supply } from '../entities';
import { RaporlarController } from './raporlar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Invoice, Payment, Patient, Supply])],
  controllers: [RaporlarController],
})
export class RaporlarModule {}
