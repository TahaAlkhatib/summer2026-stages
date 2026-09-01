import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, Patient } from '../entities';
import { HastalarController } from './hastalar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Appointment])],
  controllers: [HastalarController],
})
export class HastalarModule {}
