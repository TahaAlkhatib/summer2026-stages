import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment, AppointmentSchema, Doctor, DoctorSchema,
  Patient, PatientSchema, User, UserSchema,
} from '../schemas';
import { RandevularController } from './randevular.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RandevularController],
})
export class RandevularModule {}
