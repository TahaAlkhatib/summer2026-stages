import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, Doctor, Patient } from '../entities';
import { RandevularController } from './randevular.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, Patient])],
  controllers: [RandevularController],
})
export class RandevularModule {}
