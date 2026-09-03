import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment, AppointmentSchema, Doctor, DoctorSchema,
  MedicalRecord, MedicalRecordSchema, Patient, PatientSchema,
  Prescription, PrescriptionSchema, Supply, SupplySchema,
  SupplyUsage, SupplyUsageSchema, User, UserSchema,
} from '../schemas';
import { KayitlarController } from './kayitlar.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Supply.name, schema: SupplySchema },
      { name: SupplyUsage.name, schema: SupplyUsageSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [KayitlarController],
})
export class KayitlarModule {}
