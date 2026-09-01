import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';

import { Appointment, Doctor, Patient } from '../entities';
import { JwtGuard } from '../auth/jwt.guard';

// Randevu durumları
const DURUMLAR = ['planlandi', 'geldi', 'tamamlandi', 'iptal', 'gelmedi'];

@Controller('api/appointments')
@UseGuards(JwtGuard)
export class RandevularController {
  constructor(
    @InjectRepository(Appointment) private randevular: Repository<Appointment>,
    @InjectRepository(Doctor) private doktorlar: Repository<Doctor>,
    @InjectRepository(Patient) private hastalar: Repository<Patient>,
  ) {}

  // Randevu listesi — tarih, doktor ve durum filtreli
  @Get()
  async listele(
    @Query('date') tarih: string,
    @Query('doctorId') doktorId: string,
    @Query('status') durum: string,
    @Query('patientId') hastaId: string,
  ) {
    const kosul: any = {};

    if (tarih) {
      const gun = new Date(tarih + 'T00:00:00');
      const gunSonu = new Date(gun);
      gunSonu.setDate(gunSonu.getDate() + 1);
      kosul.startsAt = Between(gun, gunSonu);
    }
    if (doktorId) kosul.doctorId = Number(doktorId);
    if (durum) kosul.status = durum;
    if (hastaId) kosul.patientId = Number(hastaId);

    const liste = await this.randevular.find({
      where: kosul,
      relations: { patient: true, doctor: { user: true } },
      order: { startsAt: 'ASC' },
    });

    return liste.map((r) => ({
      id: r.id,
      starts_at: r.startsAt,
      duration_minutes: r.durationMinutes,
      status: r.status,
      note: r.note,
      patient_id: r.patientId,
      patient_name: r.patient?.fullName,
      patient_phone: r.patient?.phone,
      national_id: r.patient?.nationalId,
      doctor_id: r.doctorId,
      doctor_name: r.doctor?.user?.fullName,
      branch: r.doctor?.branch,
      examination_fee: Number(r.doctor?.examinationFee || 0),
    }));
  }

  @Get(':id')
  async getir(@Param('id') id: number) {
    const randevu = await this.randevular.findOne({
      where: { id },
      relations: { patient: true, doctor: { user: true } },
    });
    if (!randevu) {
      throw new NotFoundException({ message: 'Randevu bulunamadı.' });
    }
    return randevu;
  }

  // Yeni randevu — aynı doktor ve saatte başka randevu varsa engellenir
  @Post()
  async olustur(@Body() govde: any, @Req() istek: any) {
    if (!govde.patientId || !govde.doctorId || !govde.startsAt) {
      throw new BadRequestException({
        message: 'Hasta, doktor ve randevu saati zorunludur.',
      });
    }

    const hasta = await this.hastalar.findOne({ where: { id: govde.patientId } });
    if (!hasta) {
      throw new BadRequestException({ message: 'Hasta bulunamadı.' });
    }
    const doktor = await this.doktorlar.findOne({ where: { id: govde.doctorId } });
    if (!doktor) {
      throw new BadRequestException({ message: 'Doktor bulunamadı.' });
    }

    const baslangic = new Date(govde.startsAt);
    if (isNaN(baslangic.getTime())) {
      throw new BadRequestException({ message: 'Geçersiz randevu tarihi.' });
    }

    // Aynı doktorun aynı saatinde iptal edilmemiş randevu var mı
    const cakisma = await this.randevular.findOne({
      where: {
        doctorId: govde.doctorId,
        startsAt: baslangic,
        status: Not('iptal'),
      },
    });
    if (cakisma) {
      throw new BadRequestException({
        message: 'Bu doktorun seçilen saatte başka randevusu var.',
      });
    }

    const randevu = this.randevular.create({
      patientId: govde.patientId,
      doctorId: govde.doctorId,
      startsAt: baslangic,
      durationMinutes: govde.durationMinutes || 20,
      note: govde.note,
      status: 'planlandi',
      createdById: istek.user?.id,
    });
    await this.randevular.save(randevu);

    return { id: randevu.id, starts_at: randevu.startsAt, status: randevu.status };
  }

  // Durum güncelleme — resepsiyon check-in için de kullanılır
  @Put(':id/status')
  async durumGuncelle(@Param('id') id: number, @Body() govde: { status: string }) {
    if (!DURUMLAR.includes(govde.status)) {
      throw new BadRequestException({ message: 'Geçersiz randevu durumu.' });
    }

    const randevu = await this.randevular.findOne({ where: { id } });
    if (!randevu) {
      throw new NotFoundException({ message: 'Randevu bulunamadı.' });
    }
    if (randevu.status === 'tamamlandi') {
      throw new BadRequestException({
        message: 'Tamamlanmış randevu güncellenemez.',
      });
    }

    randevu.status = govde.status;
    await this.randevular.save(randevu);
    return { id: randevu.id, status: randevu.status };
  }
}
