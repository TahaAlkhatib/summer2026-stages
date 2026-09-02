import {
  BadRequestException, Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment, Invoice, MedicalRecord, Patient } from '../entities';
import { JwtGuard } from '../auth/jwt.guard';

// Hastanın kendi bilgilerine eriştiği mobil uygulama uçları.
// Hastalar personel değildir; TC kimlik no + telefon ile giriş yaparlar.
@Controller('api/patient-portal')
export class HastaPortalController {
  constructor(
    @InjectRepository(Patient) private hastalar: Repository<Patient>,
    @InjectRepository(Appointment) private randevular: Repository<Appointment>,
    @InjectRepository(MedicalRecord) private kayitlar: Repository<MedicalRecord>,
    @InjectRepository(Invoice) private faturalar: Repository<Invoice>,
    private jwt: JwtService,
  ) {}

  @Post('login')
  async giris(@Body() govde: { nationalId: string; phone: string }) {
    if (!govde.nationalId || !govde.phone) {
      throw new BadRequestException({
        message: 'TC kimlik numarası ve telefon zorunludur.',
      });
    }

    const hasta = await this.hastalar.findOne({
      where: { nationalId: govde.nationalId.trim() },
    });

    // Telefonun son 4 hanesi eşleşmeli (basit doğrulama)
    const son4 = govde.phone.replace(/\D/g, '').slice(-4);
    const kayitliSon4 = (hasta?.phone || '').replace(/\D/g, '').slice(-4);

    if (!hasta || son4.length < 4 || son4 !== kayitliSon4) {
      throw new UnauthorizedException({
        message: 'TC kimlik numarası veya telefon hatalı.',
      });
    }

    const token = await this.jwt.signAsync({
      id: hasta.id,
      role: 'hasta',
      full_name: hasta.fullName,
      patientId: hasta.id,
    });

    return {
      token,
      patient: {
        id: hasta.id,
        full_name: hasta.fullName,
        national_id: hasta.nationalId,
        phone: hasta.phone,
        blood_type: hasta.bloodType,
        allergies: hasta.allergies,
      },
    };
  }

  private hastaId(istek: any): number {
    if (istek.user?.role !== 'hasta') {
      throw new UnauthorizedException({ message: 'Bu bölüm sadece hastalar içindir.' });
    }
    return istek.user.patientId;
  }

  // Hastanın kendi randevuları
  @Get('appointments')
  @UseGuards(JwtGuard)
  async randevularim(@Req() istek: any) {
    const liste = await this.randevular.find({
      where: { patientId: this.hastaId(istek) },
      relations: { doctor: { user: true } },
      order: { startsAt: 'DESC' },
    });

    return liste.map((r) => ({
      id: r.id,
      starts_at: r.startsAt,
      status: r.status,
      note: r.note,
      doctor_name: r.doctor?.user?.fullName,
      branch: r.doctor?.branch,
    }));
  }

  // Hastanın kendi muayene kayıtları ve reçeteleri
  @Get('records')
  @UseGuards(JwtGuard)
  async kayitlarim(@Req() istek: any) {
    const liste = await this.kayitlar.find({
      where: { patientId: this.hastaId(istek) },
      relations: { prescriptions: true, appointment: { doctor: { user: true } } },
      order: { createdAt: 'DESC' },
    });

    return liste.map((k) => ({
      id: k.id,
      complaint: k.complaint,
      diagnosis: k.diagnosis,
      treatment_note: k.treatmentNote,
      created_at: k.createdAt,
      doctor_name: k.appointment?.doctor?.user?.fullName,
      branch: k.appointment?.doctor?.branch,
      prescriptions: (k.prescriptions || []).map((r) => ({
        medicine_name: r.medicineName,
        dosage: r.dosage,
        days: r.days,
      })),
    }));
  }

  // Hastanın kendi faturaları ve kalan borcu
  @Get('invoices')
  @UseGuards(JwtGuard)
  async faturalarim(@Req() istek: any) {
    const liste = await this.faturalar.find({
      where: { patientId: this.hastaId(istek) },
      relations: { payments: true },
      order: { issueDate: 'DESC' },
    });

    return liste.map((f) => {
      const toplam = Number(f.totalAmount);
      const odenen = Number(f.paidAmount);
      return {
        id: f.id,
        invoice_no: f.invoiceNo,
        description: f.description,
        session_count: f.sessionCount,
        paid_session_count: (f.payments || []).length,
        total_amount: toplam,
        paid_amount: odenen,
        remaining: toplam - odenen,
        is_paid: odenen >= toplam,
        issue_date: f.issueDate,
        payments: (f.payments || [])
          .sort((a, b) => a.id - b.id)
          .map((o) => ({
            amount: Number(o.amount),
            method: o.method,
            session_no: o.sessionNo,
            created_at: o.createdAt,
          })),
      };
    });
  }
}
