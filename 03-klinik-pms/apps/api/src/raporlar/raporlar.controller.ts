import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Appointment, AppointmentDocument, Invoice, InvoiceDocument,
  Patient, PatientDocument, Payment, PaymentDocument, Supply, SupplyDocument,
} from '../schemas';
import { JwtGuard } from '../auth/jwt.guard';
import { ayBasi, gunBasi, gunMetni, gunSonu } from '../tarih';

@Controller('api/reports')
@UseGuards(JwtGuard)
export class RaporlarController {
  constructor(
    @InjectModel(Appointment.name) private randevular: Model<AppointmentDocument>,
    @InjectModel(Invoice.name) private faturalar: Model<InvoiceDocument>,
    @InjectModel(Payment.name) private odemeler: Model<PaymentDocument>,
    @InjectModel(Patient.name) private hastalar: Model<PatientDocument>,
    @InjectModel(Supply.name) private malzemeler: Model<SupplyDocument>,
  ) {}

  @Get('summary')
  async ozet() {
    const bugun = gunBasi();
    const yarin = gunSonu();

    const bugunkuRandevular = await this.randevular.find({
      startsAt: { $gte: bugun, $lt: yarin },
    });

    const durumSayilari: Record<string, number> = {
      planlandi: 0, geldi: 0, tamamlandi: 0, iptal: 0, gelmedi: 0,
    };
    for (const r of bugunkuRandevular) {
      if (durumSayilari[r.status] !== undefined) {
        durumSayilari[r.status]++;
      }
    }

    const tumFaturalar = await this.faturalar.find();
    const odenmemisToplam = tumFaturalar
      .filter((f) => Number(f.paidAmount) < Number(f.totalAmount))
      .reduce((t, f) => t + (Number(f.totalAmount) - Number(f.paidAmount)), 0);

    const ayOdemeleri = await this.odemeler.find({
      createdAt: { $gte: ayBasi(), $lt: yarin },
    });
    const ayTahsilat = ayOdemeleri.reduce((t, o) => t + Number(o.amount), 0);

    const hastaSayisi = await this.hastalar.countDocuments();

    const tumMalzemeler = await this.malzemeler.find();
    const kritikMalzemeler = tumMalzemeler.filter((m) => m.stockQuantity <= m.minStock);

    return {
      today_appointments: bugunkuRandevular.length,
      today_status_counts: durumSayilari,
      patient_count: hastaSayisi,
      month_collected: ayTahsilat,
      unpaid_total: odenmemisToplam,
      low_stock_count: kritikMalzemeler.length,
      low_stock_items: kritikMalzemeler.map((m) => ({
        name: m.name,
        stock_quantity: m.stockQuantity,
        min_stock: m.minStock,
      })),
    };
  }

  // Gün sonu kasa raporu — tahsilatların yöntem dağılımı
  @Get('daily')
  async gunluk(@Query('date') tarih: string) {
    const gun = gunBasi(tarih || undefined);
    const bitis = gunSonu(tarih || undefined);

    const odemeler = await this.odemeler
      .find({ createdAt: { $gte: gun, $lt: bitis } })
      .sort({ createdAt: 1 });

    const kasa: Record<string, number> = { nakit: 0, kart: 0, havale: 0, toplam: 0 };
    for (const o of odemeler) {
      const tutar = Number(o.amount);
      if (kasa[o.method] !== undefined) {
        kasa[o.method] += tutar;
      }
      kasa.toplam += tutar;
    }

    // Ödemelerin fatura ve hasta bilgisini tek tek çekiyoruz
    const odemeListesi = [];
    for (const o of odemeler) {
      const fatura = await this.faturalar.findById(o.invoiceId);
      const hasta = fatura ? await this.hastalar.findById(fatura.patientId) : null;
      odemeListesi.push({
        id: o._id.toString(),
        amount: Number(o.amount),
        method: o.method,
        session_no: o.sessionNo,
        invoice_no: fatura?.invoiceNo,
        patient_name: hasta?.fullName,
        created_at: o.createdAt,
      });
    }

    const randevular = await this.randevular.find({
      startsAt: { $gte: gun, $lt: bitis },
    });

    return {
      date: gunMetni(tarih || undefined),
      appointment_count: randevular.length,
      completed_count: randevular.filter((r) => r.status === 'tamamlandi').length,
      collected: kasa,
      payments: odemeListesi,
    };
  }
}
