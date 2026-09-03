import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment, AppointmentSchema, Invoice, InvoiceSchema,
  Patient, PatientSchema, Payment, PaymentSchema, Supply, SupplySchema,
} from '../schemas';
import { RaporlarController } from './raporlar.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Supply.name, schema: SupplySchema },
    ]),
  ],
  controllers: [RaporlarController],
})
export class RaporlarModule {}
