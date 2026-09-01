import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, Patient, Payment } from '../entities';
import { FaturalarController } from './faturalar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Payment, Patient])],
  controllers: [FaturalarController],
})
export class FaturalarModule {}
