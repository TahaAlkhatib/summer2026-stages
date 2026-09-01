import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice, Patient, Payment } from '../entities';
import { JwtGuard } from '../auth/jwt.guard';

const YONTEMLER = ['nakit', 'kart', 'havale'];

@Controller('api/invoices')
@UseGuards(JwtGuard)
export class FaturalarController {
  constructor(
    @InjectRepository(Invoice) private faturalar: Repository<Invoice>,
    @InjectRepository(Payment) private odemeler: Repository<Payment>,
    @InjectRepository(Patient) private hastalar: Repository<Patient>,
  ) {}

  @Get()
  async listele(@Query('patientId') hastaId: string, @Query('unpaid') odenmemis: string) {
    const kosul: any = {};
    if (hastaId) kosul.patientId = Number(hastaId);

    let liste = await this.faturalar.find({
      where: kosul,
      relations: { patient: true, payments: true },
      order: { issueDate: 'DESC' },
    });

    if (odenmemis === '1') {
      liste = liste.filter((f) => Number(f.paidAmount) < Number(f.totalAmount));
    }

    return liste.map((f) => this.faturaOzeti(f));
  }

  @Get(':id')
  async getir(@Param('id') id: number) {
    const fatura = await this.faturalar.findOne({
      where: { id },
      relations: { patient: true, payments: true },
    });
    if (!fatura) {
      throw new NotFoundException({ message: 'Fatura bulunamadı.' });
    }

    const ozet = this.faturaOzeti(fatura);
    return {
      ...ozet,
      patient: {
        id: fatura.patient?.id,
        full_name: fatura.patient?.fullName,
        national_id: fatura.patient?.nationalId,
        phone: fatura.patient?.phone,
        address: fatura.patient?.address,
      },
      payments: (fatura.payments || [])
        .sort((a, b) => a.id - b.id)
        .map((o) => ({
          id: o.id,
          amount: Number(o.amount),
          method: o.method,
          session_no: o.sessionNo,
          created_at: o.createdAt,
        })),
    };
  }

  // Çok seanslı tedavi faturası
  @Post()
  async kes(@Body() govde: any) {
    if (!govde.patientId) {
      throw new BadRequestException({ message: 'Hasta seçilmelidir.' });
    }
    if (!govde.description || govde.description.trim() === '') {
      throw new BadRequestException({ message: 'Fatura açıklaması zorunludur.' });
    }

    const tutar = Number(govde.totalAmount);
    if (!tutar || tutar <= 0) {
      throw new BadRequestException({ message: 'Tutar sıfırdan büyük olmalıdır.' });
    }

    const hasta = await this.hastalar.findOne({ where: { id: govde.patientId } });
    if (!hasta) {
      throw new BadRequestException({ message: 'Hasta bulunamadı.' });
    }

    const yil = new Date().getFullYear();
    const sayac = await this.faturalar.count();
    const faturaNo = 'KF-' + yil + '-' + String(sayac + 1).padStart(5, '0');

    const fatura = this.faturalar.create({
      invoiceNo: faturaNo,
      patientId: govde.patientId,
      description: govde.description,
      sessionCount: govde.sessionCount && govde.sessionCount > 0 ? govde.sessionCount : 1,
      totalAmount: String(tutar),
      paidAmount: '0',
    });
    await this.faturalar.save(fatura);

    return { id: fatura.id, invoice_no: fatura.invoiceNo, total_amount: tutar };
  }

  // Seans / taksit tahsilatı
  @Post(':id/payments')
  async tahsilat(@Param('id') id: number, @Body() govde: any, @Req() istek: any) {
    const fatura = await this.faturalar.findOne({
      where: { id },
      relations: { payments: true },
    });
    if (!fatura) {
      throw new NotFoundException({ message: 'Fatura bulunamadı.' });
    }

    const tutar = Number(govde.amount);
    if (!tutar || tutar <= 0) {
      throw new BadRequestException({ message: 'Tutar sıfırdan büyük olmalıdır.' });
    }
    if (!YONTEMLER.includes(govde.method)) {
      throw new BadRequestException({
        message: 'Ödeme yöntemi nakit, kart veya havale olmalıdır.',
      });
    }

    const kalan = Number(fatura.totalAmount) - Number(fatura.paidAmount);
    if (tutar > kalan) {
      throw new BadRequestException({
        message: 'Ödeme tutarı kalan borçtan fazla olamaz. Kalan: ' + kalan.toFixed(2) + ' ₺',
      });
    }

    const odeme = this.odemeler.create({
      invoiceId: id,
      amount: String(tutar),
      method: govde.method,
      sessionNo: govde.sessionNo || (fatura.payments?.length || 0) + 1,
      receivedById: istek.user?.id,
    });
    await this.odemeler.save(odeme);

    // Ödenen tutarı yeniden hesapla
    const tumOdemeler = await this.odemeler.find({ where: { invoiceId: id } });
    const toplamOdenen = tumOdemeler.reduce((t, o) => t + Number(o.amount), 0);
    fatura.paidAmount = String(toplamOdenen);
    await this.faturalar.save(fatura);

    return {
      payment: { id: odeme.id, amount: tutar, session_no: odeme.sessionNo },
      invoice: {
        id: fatura.id,
        total_amount: Number(fatura.totalAmount),
        paid_amount: toplamOdenen,
        remaining: Number(fatura.totalAmount) - toplamOdenen,
      },
    };
  }

  private faturaOzeti(f: Invoice) {
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
      patient_id: f.patientId,
      patient_name: f.patient?.fullName,
      patient_phone: f.patient?.phone,
    };
  }
}
