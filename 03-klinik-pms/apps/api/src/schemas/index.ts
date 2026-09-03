import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongoSchema, Types } from 'mongoose';

// MongoDB her kaydı "_id" alanında tutar. Arayüzler "id" alanını beklediği
// için JSON'a çevirirken alan adını değiştiriyoruz.
export const jsonAyarlari = {
  versionKey: false,
  transform: (belge: any, nesne: any) => {
    nesne.id = nesne._id.toString();
    delete nesne._id;
    return nesne;
  },
};

// Personel: admin (yönetici), doktor, resepsiyon
@Schema({ collection: 'users', toJSON: jsonAyarlari })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  role: string;

  @Prop()
  phone: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ collection: 'patients', toJSON: jsonAyarlari })
export class Patient {
  @Prop({ required: true, unique: true })
  nationalId: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  birthDate: string;

  // kadin / erkek
  @Prop()
  gender: string;

  // "AB Rh+" gibi değerler saklanır
  @Prop()
  bloodType: string;

  @Prop()
  allergies: string;

  @Prop()
  address: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}
export type PatientDocument = HydratedDocument<Patient>;
export const PatientSchema = SchemaFactory.createForClass(Patient);

@Schema({ collection: 'doctors', toJSON: jsonAyarlari })
export class Doctor {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  // Branş: Dahiliye, Kardiyoloji, Ortopedi, Cildiye, Fizik Tedavi ...
  @Prop({ required: true })
  branch: string;

  @Prop({ default: 0 })
  examinationFee: number;

  @Prop({ default: true })
  isActive: boolean;
}
export type DoctorDocument = HydratedDocument<Doctor>;
export const DoctorSchema = SchemaFactory.createForClass(Doctor);

// Randevu durumları: planlandi -> geldi -> tamamlandi | iptal | gelmedi
@Schema({ collection: 'appointments', toJSON: jsonAyarlari })
export class Appointment {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: Patient.name, required: true })
  patientId: Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: Doctor.name, required: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  startsAt: Date;

  @Prop({ default: 20 })
  durationMinutes: number;

  @Prop({ default: 'planlandi' })
  status: string;

  @Prop()
  note: string;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: User.name })
  createdById: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}
export type AppointmentDocument = HydratedDocument<Appointment>;
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Muayene kaydı — bir randevuya bağlıdır
@Schema({ collection: 'medical_records', toJSON: jsonAyarlari })
export class MedicalRecord {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: Appointment.name, required: true })
  appointmentId: Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: Patient.name, required: true })
  patientId: Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: Doctor.name, required: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true })
  complaint: string;

  @Prop()
  diagnosis: string;

  @Prop()
  treatmentNote: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}
export type MedicalRecordDocument = HydratedDocument<MedicalRecord>;
export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);

@Schema({ collection: 'prescriptions', toJSON: jsonAyarlari })
export class Prescription {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: MedicalRecord.name, required: true })
  recordId: Types.ObjectId;

  @Prop({ required: true })
  medicineName: string;

  // Örn: "Günde 2 kez, 1 tablet"
  @Prop({ required: true })
  dosage: string;

  @Prop({ default: 7 })
  days: number;

  @Prop()
  note: string;
}
export type PrescriptionDocument = HydratedDocument<Prescription>;
export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);

// Sarf malzeme stoğu (enjektör, gazlı bez, eldiven ...)
@Schema({ collection: 'supplies', toJSON: jsonAyarlari })
export class Supply {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'adet' })
  unit: string;

  @Prop({ default: 0 })
  unitPrice: number;

  @Prop({ default: 0 })
  stockQuantity: number;

  @Prop({ default: 10 })
  minStock: number;
}
export type SupplyDocument = HydratedDocument<Supply>;
export const SupplySchema = SchemaFactory.createForClass(Supply);

@Schema({ collection: 'supply_usages', toJSON: jsonAyarlari })
export class SupplyUsage {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: MedicalRecord.name, required: true })
  recordId: Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: Supply.name, required: true })
  supplyId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: Date.now })
  usedAt: Date;
}
export type SupplyUsageDocument = HydratedDocument<SupplyUsage>;
export const SupplyUsageSchema = SchemaFactory.createForClass(SupplyUsage);

// Fatura — çok seanslı tedaviler için seans sayısı tutulur
@Schema({ collection: 'invoices', toJSON: jsonAyarlari })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNo: string;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: Patient.name, required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 1 })
  sessionCount: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ default: Date.now })
  issueDate: Date;
}
export type InvoiceDocument = HydratedDocument<Invoice>;
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Taksitli / seans bazlı tahsilat
@Schema({ collection: 'payments', toJSON: jsonAyarlari })
export class Payment {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: Invoice.name, required: true })
  invoiceId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  // nakit / kart / havale
  @Prop({ required: true })
  method: string;

  // Kaçıncı seansın ödemesi
  @Prop()
  sessionNo: number;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: User.name })
  receivedById: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}
export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
