import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';

// Personel: admin (yönetici), doktor, resepsiyon
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 200 })
  passwordHash: string;

  @Column({ length: 20 })
  role: string;

  @Column({ length: 25, nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 11, unique: true })
  nationalId: string;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 25 })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birthDate: string;

  // kadin / erkek
  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ length: 5, nullable: true })
  bloodType: string;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  // Branş: Dahiliye, Kardiyoloji, Ortopedi, Cildiye, Fizik Tedavi ...
  @Column({ length: 60 })
  branch: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  examinationFee: string;

  @Column({ default: true })
  isActive: boolean;
}

// Randevu durumları: planlandi -> geldi -> tamamlandi | iptal | gelmedi
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: number;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: number;

  @Column({ type: 'timestamp' })
  startsAt: Date;

  @Column({ default: 20 })
  durationMinutes: number;

  @Column({ length: 20, default: 'planlandi' })
  status: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ nullable: true })
  createdById: number;

  @CreateDateColumn()
  createdAt: Date;
}

// Muayene kaydı — bir randevuya bağlıdır
@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column()
  appointmentId: number;

  @Column()
  patientId: number;

  @Column()
  doctorId: number;

  @Column({ type: 'text' })
  complaint: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  treatmentNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Prescription, (r) => r.record)
  prescriptions: Prescription[];

  @OneToMany(() => SupplyUsage, (k) => k.record)
  supplyUsages: SupplyUsage[];
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MedicalRecord, (k) => k.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recordId' })
  record: MedicalRecord;

  @Column()
  recordId: number;

  @Column({ length: 150 })
  medicineName: string;

  // Örn: "Günde 2 kez, 1 tablet"
  @Column({ length: 200 })
  dosage: string;

  @Column({ default: 7 })
  days: number;

  @Column({ type: 'text', nullable: true })
  note: string;
}

// Sarf malzeme stoğu (enjektör, gazlı bez, eldiven ...)
@Entity('supplies')
export class Supply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 10, default: 'adet' })
  unit: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  unitPrice: string;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: 10 })
  minStock: number;
}

@Entity('supply_usages')
export class SupplyUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MedicalRecord, (k) => k.supplyUsages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recordId' })
  record: MedicalRecord;

  @Column()
  recordId: number;

  @ManyToOne(() => Supply)
  @JoinColumn({ name: 'supplyId' })
  supply: Supply;

  @Column()
  supplyId: number;

  @Column()
  quantity: number;

  @CreateDateColumn()
  usedAt: Date;
}

// Fatura — çok seanslı tedaviler için seans sayısı tutulur
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  invoiceNo: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: number;

  @Column({ length: 200 })
  description: string;

  @Column({ default: 1 })
  sessionCount: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  totalAmount: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  paidAmount: string;

  @CreateDateColumn()
  issueDate: Date;

  @OneToMany(() => Payment, (o) => o.invoice)
  payments: Payment[];
}

// Taksitli / seans bazlı tahsilat
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, (f) => f.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column()
  invoiceId: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: string;

  // nakit / kart / havale
  @Column({ length: 10 })
  method: string;

  // Kaçıncı seansın ödemesi
  @Column({ nullable: true })
  sessionNo: number;

  @Column({ nullable: true })
  receivedById: number;

  @CreateDateColumn()
  createdAt: Date;
}
