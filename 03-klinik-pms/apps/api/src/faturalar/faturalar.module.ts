import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Invoice, InvoiceSchema, Patient, PatientSchema, Payment, PaymentSchema,
} from '../schemas';
import { FaturalarController } from './faturalar.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  controllers: [FaturalarController],
})
export class FaturalarModule {}
