import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment, AppointmentSchema, Doctor, DoctorSchema, User, UserSchema,
} from '../schemas';
import { DoktorlarController } from './doktorlar.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: User.name, schema: UserSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [DoktorlarController],
})
export class DoktorlarModule {}
