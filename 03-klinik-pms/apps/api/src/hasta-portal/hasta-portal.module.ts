import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment, AppointmentSchema, Doctor, DoctorSchema,
  Invoice, InvoiceSchema, MedicalRecord, MedicalRecordSchema,
  Patient, PatientSchema, Payment, PaymentSchema,
  Prescription, PrescriptionSchema, User, UserSchema,
} from '../schemas';
import { HastaPortalController } from './hasta-portal.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: MedicalRecord.name, schema: MedicalRecordSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [HastaPortalController],
})
export class HastaPortalModule {}
