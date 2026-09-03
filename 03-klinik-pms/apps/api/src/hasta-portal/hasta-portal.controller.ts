import {
  BadRequestException, Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Appointment, AppointmentDocument, Doctor, DoctorDocument,
  Invoice, InvoiceDocument, MedicalRecord, MedicalRecordDocument,
  Patient, PatientDocument, Payment, PaymentDocument,
  Prescription, PrescriptionDocument, User, UserDocument,
} from '../schemas';
import { JwtGuard } from '../auth/jwt.guard';

// Hastanın kendi bilgilerine eriştiği mobil uygulama uçları.
// Hastalar personel değildir; TC kimlik no + telefon ile giriş yaparlar.
@Controller('api/patient-portal')
export class HastaPortalController {
  constructor(
    @InjectModel(Patient.name) private hastalar: Model<PatientDocument>,
    @InjectModel(Appointment.name) private randevular: Model<AppointmentDocument>,
    @InjectModel(MedicalRecord.name) private kayitlar: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name) private receteler: Model<PrescriptionDocument>,
    @InjectModel(Invoice.name) private faturalar: Model<InvoiceDocument>,
    @InjectModel(Payment.name) private odemeler: Model<PaymentDocument>,
    @InjectModel(Doctor.name) private doktorlar: Model<DoctorDocument>,
    @InjectModel(User.name) private kullanicilar: Model<UserDocument>,
    private jwt: JwtService,
  ) {}

  @Post('login')
  async giris(@Body() govde: { nationalId: string; phone: string }) {
    if (!govde.nationalId || !govde.phone) {
      throw new BadRequestException({
        message: 'TC kimlik numarası ve telefon zorunludur.',
      });
    }

    const hasta = await this.hastalar.findOne({ nationalId: govde.nationalId.trim() });

    // Telefonun son 4 hanesi eşleşmeli (basit doğrulama)
    const son4 = govde.phone.replace(/\D/g, '').slice(-4);
    const kayitliSon4 = (hasta?.phone || '').replace(/\D/g, '').slice(-4);

    if (!hasta || son4.length < 4 || son4 !== kayitliSon4) {
      throw new UnauthorizedException({
        message: 'TC kimlik numarası veya telefon hatalı.',
      });
    }

    const token = await this.jwt.signAsync({
      id: hasta._id.toString(),
      role: 'hasta',
      full_name: hasta.fullName,
      patientId: hasta._id.toString(),
    });

    return {
      token,
      patient: {
        id: hasta._id.toString(),
        full_name: hasta.fullName,
        national_id: hasta.nationalId,
        phone: hasta.phone,
        blood_type: hasta.bloodType,
        allergies: hasta.allergies,
      },
    };
  }

  private hastaId(istek: any): string {
    if (istek.user?.role !== 'hasta') {
      throw new UnauthorizedException({ message: 'Bu bölüm sadece hastalar içindir.' });
    }
    return istek.user.patientId;
  }

  // Doktorun adını ve branşını bulur
  private async doktorBilgisi(doktorId: any) {
    const doktor = await this.doktorlar.findById(doktorId);
    if (!doktor) {
      return { doctor_name: null, branch: null };
    }
    const kullanici = await this.kullanicilar.findById(doktor.userId);
    return { doctor_name: kullanici?.fullName, branch: doktor.branch };
  }

  // Hastanın kendi randevuları
  @Get('appointments')
  @UseGuards(JwtGuard)
  async randevularim(@Req() istek: any) {
    const liste = await this.randevular
      .find({ patientId: this.hastaId(istek) })
      .sort({ startsAt: -1 });

    const cevap = [];
    for (const r of liste) {
      const doktor = await this.doktorBilgisi(r.doctorId);
      cevap.push({
        id: r._id.toString(),
        starts_at: r.startsAt,
        status: r.status,
        note: r.note,
        doctor_name: doktor.doctor_name,
        branch: doktor.branch,
      });
    }
    return cevap;
  }

  // Hastanın kendi muayene kayıtları ve reçeteleri
  @Get('records')
  @UseGuards(JwtGuard)
  async kayitlarim(@Req() istek: any) {
    const liste = await this.kayitlar
      .find({ patientId: this.hastaId(istek) })
      .sort({ createdAt: -1 });

    const cevap = [];
    for (const k of liste) {
      const doktor = await this.doktorBilgisi(k.doctorId);
      const receteler = await this.receteler.find({ recordId: k._id });
      cevap.push({
        id: k._id.toString(),
        complaint: k.complaint,
        diagnosis: k.diagnosis,
        treatment_note: k.treatmentNote,
        created_at: k.createdAt,
        doctor_name: doktor.doctor_name,
        branch: doktor.branch,
        prescriptions: receteler.map((r) => ({
          medicine_name: r.medicineName,
          dosage: r.dosage,
          days: r.days,
        })),
      });
    }
    return cevap;
  }

  // Hastanın kendi faturaları ve kalan borcu
  @Get('invoices')
  @UseGuards(JwtGuard)
  async faturalarim(@Req() istek: any) {
    const liste = await this.faturalar
      .find({ patientId: this.hastaId(istek) })
      .sort({ issueDate: -1 });

    const cevap = [];
    for (const f of liste) {
      const odemeler = await this.odemeler.find({ invoiceId: f._id }).sort({ createdAt: 1 });
      const toplam = Number(f.totalAmount);
      const odenen = Number(f.paidAmount);
      cevap.push({
        id: f._id.toString(),
        invoice_no: f.invoiceNo,
        description: f.description,
        session_count: f.sessionCount,
        paid_session_count: odemeler.length,
        total_amount: toplam,
        paid_amount: odenen,
        remaining: toplam - odenen,
        is_paid: odenen >= toplam,
        issue_date: f.issueDate,
        payments: odemeler.map((o) => ({
          amount: Number(o.amount),
          method: o.method,
          session_no: o.sessionNo,
          created_at: o.createdAt,
        })),
      });
    }
    return cevap;
  }
}
