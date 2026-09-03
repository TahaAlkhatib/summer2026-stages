import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment, AppointmentSchema, Doctor, DoctorSchema,
  Patient, PatientSchema, User, UserSchema,
} from '../schemas';
import { HastalarController } from './hastalar.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [HastalarController],
})
export class HastalarModule {}
