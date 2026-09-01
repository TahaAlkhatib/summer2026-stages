import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Appointment, Invoice, Patient, Payment, Supply } from '../entities';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/reports')
@UseGuards(JwtGuard)
export class RaporlarController {
  constructor(
    @InjectRepository(Appointment) private randevular: Repository<Appointment>,
    @InjectRepository(Invoice) private faturalar: Repository<Invoice>,
    @InjectRepository(Payment) private odemeler: Repository<Payment>,
    @InjectRepository(Patient) private hastalar: Repository<Patient>,
    @InjectRepository(Supply) private malzemeler: Repository<Supply>,
  ) {}

  @Get('summary')
  async ozet() {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const yarin = new Date(bugun);
    yarin.setDate(yarin.getDate() + 1);

    const ayBasi = new Date(bugun.getFullYear(), bugun.getMonth(), 1);

    const bugunkuRandevular = await this.randevular.find({
      where: { startsAt: Between(bugun, yarin) },
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
      where: { createdAt: Between(ayBasi, yarin) },
    });
    const ayTahsilat = ayOdemeleri.reduce((t, o) => t + Number(o.amount), 0);

    const hastaSayisi = await this.hastalar.count();

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
    const gun = tarih ? new Date(tarih + 'T00:00:00') : new Date();
    gun.setHours(0, 0, 0, 0);
    const gunSonu = new Date(gun);
    gunSonu.setDate(gunSonu.getDate() + 1);

    const odemeler = await this.odemeler.find({
      where: { createdAt: Between(gun, gunSonu) },
      relations: { invoice: { patient: true } },
      order: { createdAt: 'ASC' },
    });

    const kasa: Record<string, number> = { nakit: 0, kart: 0, havale: 0, toplam: 0 };
    for (const o of odemeler) {
      const tutar = Number(o.amount);
      if (kasa[o.method] !== undefined) {
        kasa[o.method] += tutar;
      }
      kasa.toplam += tutar;
    }

    const randevular = await this.randevular.find({
      where: { startsAt: Between(gun, gunSonu) },
    });

    // Yerel günü döndür (UTC kaymasını önlemek için)
    const yerelTarih =
      gun.getFullYear() + '-' +
      String(gun.getMonth() + 1).padStart(2, '0') + '-' +
      String(gun.getDate()).padStart(2, '0');

    return {
      date: yerelTarih,
      appointment_count: randevular.length,
      completed_count: randevular.filter((r) => r.status === 'tamamlandi').length,
      collected: kasa,
      payments: odemeler.map((o) => ({
        id: o.id,
        amount: Number(o.amount),
        method: o.method,
        session_no: o.sessionNo,
        invoice_no: o.invoice?.invoiceNo,
        patient_name: o.invoice?.patient?.fullName,
        created_at: o.createdAt,
      })),
    };
  }
}
