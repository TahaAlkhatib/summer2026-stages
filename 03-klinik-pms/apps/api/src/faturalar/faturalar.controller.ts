import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Invoice, InvoiceDocument, Patient, PatientDocument, Payment, PaymentDocument,
} from '../schemas';
import { JwtGuard } from '../auth/jwt.guard';

const YONTEMLER = ['nakit', 'kart', 'havale'];

@Controller('api/invoices')
@UseGuards(JwtGuard)
export class FaturalarController {
  constructor(
    @InjectModel(Invoice.name) private faturalar: Model<InvoiceDocument>,
    @InjectModel(Payment.name) private odemeler: Model<PaymentDocument>,
    @InjectModel(Patient.name) private hastalar: Model<PatientDocument>,
  ) {}

  @Get()
  async listele(@Query('patientId') hastaId: string, @Query('unpaid') odenmemis: string) {
    const kosul: any = {};
    if (hastaId) kosul.patientId = hastaId;

    let liste = await this.faturalar.find(kosul).sort({ issueDate: -1 }).catch(() => []);

    if (odenmemis === '1') {
      liste = liste.filter((f) => Number(f.paidAmount) < Number(f.totalAmount));
    }

    const cevap = [];
    for (const f of liste) {
      const hasta = await this.hastalar.findById(f.patientId);
      const odemeSayisi = await this.odemeler.countDocuments({ invoiceId: f._id });
      cevap.push(this.faturaOzeti(f, hasta, odemeSayisi));
    }
    return cevap;
  }

  @Get(':id')
  async getir(@Param('id') id: string) {
    const fatura = await this.faturalar.findById(id).catch(() => null);
    if (!fatura) {
      throw new NotFoundException({ message: 'Fatura bulunamadı.' });
    }

    const hasta = await this.hastalar.findById(fatura.patientId);
    const odemeler = await this.odemeler.find({ invoiceId: fatura._id }).sort({ createdAt: 1 });

    const ozet = this.faturaOzeti(fatura, hasta, odemeler.length);
    return {
      ...ozet,
      patient: {
        id: hasta?._id?.toString(),
        full_name: hasta?.fullName,
        national_id: hasta?.nationalId,
        phone: hasta?.phone,
        address: hasta?.address,
      },
      payments: odemeler.map((o) => ({
        id: o._id.toString(),
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

    const hasta = await this.hastalar.findById(govde.patientId).catch(() => null);
    if (!hasta) {
      throw new BadRequestException({ message: 'Hasta bulunamadı.' });
    }

    const yil = new Date().getFullYear();
    const sayac = await this.faturalar.countDocuments();
    const faturaNo = 'KF-' + yil + '-' + String(sayac + 1).padStart(5, '0');

    const fatura = await this.faturalar.create({
      invoiceNo: faturaNo,
      patientId: hasta._id,
      description: govde.description,
      sessionCount: govde.sessionCount && govde.sessionCount > 0 ? govde.sessionCount : 1,
      totalAmount: tutar,
      paidAmount: 0,
    });

    return { id: fatura._id.toString(), invoice_no: fatura.invoiceNo, total_amount: tutar };
  }

  // Seans / taksit tahsilatı
  @Post(':id/payments')
  async tahsilat(@Param('id') id: string, @Body() govde: any, @Req() istek: any) {
    const fatura = await this.faturalar.findById(id).catch(() => null);
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

    const oncekiSayi = await this.odemeler.countDocuments({ invoiceId: fatura._id });
    const odeme = await this.odemeler.create({
      invoiceId: fatura._id,
      amount: tutar,
      method: govde.method,
      sessionNo: govde.sessionNo || oncekiSayi + 1,
      receivedById: istek.user?.id,
    });

    // Ödenen tutarı yeniden hesapla
    const tumOdemeler = await this.odemeler.find({ invoiceId: fatura._id });
    const toplamOdenen = tumOdemeler.reduce((t, o) => t + Number(o.amount), 0);
    fatura.paidAmount = toplamOdenen;
    await fatura.save();

    return {
      payment: { id: odeme._id.toString(), amount: tutar, session_no: odeme.sessionNo },
      invoice: {
        id: fatura._id.toString(),
        total_amount: Number(fatura.totalAmount),
        paid_amount: toplamOdenen,
        remaining: Number(fatura.totalAmount) - toplamOdenen,
      },
    };
  }

  private faturaOzeti(f: InvoiceDocument, hasta: PatientDocument | null, odemeSayisi: number) {
    const toplam = Number(f.totalAmount);
    const odenen = Number(f.paidAmount);
    return {
      id: f._id.toString(),
      invoice_no: f.invoiceNo,
      description: f.description,
      session_count: f.sessionCount,
      paid_session_count: odemeSayisi,
      total_amount: toplam,
      paid_amount: odenen,
      remaining: toplam - odenen,
      is_paid: odenen >= toplam,
      issue_date: f.issueDate,
      patient_id: f.patientId?.toString(),
      patient_name: hasta?.fullName,
      patient_phone: hasta?.phone,
    };
  }
}
