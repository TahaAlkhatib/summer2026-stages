import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment, Doctor, User } from '../entities';
import { DoktorlarController } from './doktorlar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, User, Appointment])],
  controllers: [DoktorlarController],
})
export class DoktorlarModule {}
