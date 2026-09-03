import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Appointment, AppointmentDocument, Doctor, DoctorDocument,
  Patient, PatientDocument, User, UserDocument,
} from '../schemas';
import { JwtGuard } from '../auth/jwt.guard';
import { gunBasi, gunSonu } from '../tarih';

// Randevu durumları
const DURUMLAR = ['planlandi', 'geldi', 'tamamlandi', 'iptal', 'gelmedi'];

@Controller('api/appointments')
@UseGuards(JwtGuard)
export class RandevularController {
  constructor(
    @InjectModel(Appointment.name) private randevular: Model<AppointmentDocument>,
    @InjectModel(Doctor.name) private doktorlar: Model<DoctorDocument>,
    @InjectModel(Patient.name) private hastalar: Model<PatientDocument>,
    @InjectModel(User.name) private kullanicilar: Model<UserDocument>,
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
      kosul.startsAt = { $gte: gunBasi(tarih), $lt: gunSonu(tarih) };
    }
    if (doktorId) kosul.doctorId = doktorId;
    if (durum) kosul.status = durum;
    if (hastaId) kosul.patientId = hastaId;

    const liste = await this.randevular.find(kosul).sort({ startsAt: 1 });

    const cevap = [];
    for (const r of liste) {
      const hasta = await this.hastalar.findById(r.patientId);
      const doktor = await this.doktorlar.findById(r.doctorId);
      const doktorKullanici = doktor ? await this.kullanicilar.findById(doktor.userId) : null;

      cevap.push({
        id: r._id.toString(),
        starts_at: r.startsAt,
        duration_minutes: r.durationMinutes,
        status: r.status,
        note: r.note,
        patient_id: r.patientId?.toString(),
        patient_name: hasta?.fullName,
        patient_phone: hasta?.phone,
        national_id: hasta?.nationalId,
        doctor_id: r.doctorId?.toString(),
        doctor_name: doktorKullanici?.fullName,
        branch: doktor?.branch,
        examination_fee: Number(doktor?.examinationFee || 0),
      });
    }

    return cevap;
  }

  @Get(':id')
  async getir(@Param('id') id: string) {
    const randevu = await this.randevular.findById(id).catch(() => null);
    if (!randevu) {
      throw new NotFoundException({ message: 'Randevu bulunamadı.' });
    }

    const hasta = await this.hastalar.findById(randevu.patientId);
    const doktor = await this.doktorlar.findById(randevu.doctorId);
    const doktorKullanici = doktor ? await this.kullanicilar.findById(doktor.userId) : null;

    const cevap: any = randevu.toJSON();
    cevap.patient = hasta ? hasta.toJSON() : null;
    cevap.doctor = doktor
      ? { ...doktor.toJSON(), user: doktorKullanici ? doktorKullanici.toJSON() : null }
      : null;
    return cevap;
  }

  // Yeni randevu — aynı doktor ve saatte başka randevu varsa engellenir
  @Post()
  async olustur(@Body() govde: any, @Req() istek: any) {
    if (!govde.patientId || !govde.doctorId || !govde.startsAt) {
      throw new BadRequestException({
        message: 'Hasta, doktor ve randevu saati zorunludur.',
      });
    }

    const hasta = await this.hastalar.findById(govde.patientId).catch(() => null);
    if (!hasta) {
      throw new BadRequestException({ message: 'Hasta bulunamadı.' });
    }
    const doktor = await this.doktorlar.findById(govde.doctorId).catch(() => null);
    if (!doktor) {
      throw new BadRequestException({ message: 'Doktor bulunamadı.' });
    }

    const baslangic = new Date(govde.startsAt);
    if (isNaN(baslangic.getTime())) {
      throw new BadRequestException({ message: 'Geçersiz randevu tarihi.' });
    }

    // Aynı doktorun aynı saatinde iptal edilmemiş randevu var mı
    const cakisma = await this.randevular.findOne({
      doctorId: doktor._id,
      startsAt: baslangic,
      status: { $ne: 'iptal' },
    });
    if (cakisma) {
      throw new BadRequestException({
        message: 'Bu doktorun seçilen saatte başka randevusu var.',
      });
    }

    const randevu = await this.randevular.create({
      patientId: hasta._id,
      doctorId: doktor._id,
      startsAt: baslangic,
      durationMinutes: govde.durationMinutes || 20,
      note: govde.note,
      status: 'planlandi',
      createdById: istek.user?.id,
    });

    return { id: randevu._id.toString(), starts_at: randevu.startsAt, status: randevu.status };
  }

  // Durum güncelleme — resepsiyon check-in için de kullanılır
  @Put(':id/status')
  async durumGuncelle(@Param('id') id: string, @Body() govde: { status: string }) {
    if (!DURUMLAR.includes(govde.status)) {
      throw new BadRequestException({ message: 'Geçersiz randevu durumu.' });
    }

    const randevu = await this.randevular.findById(id).catch(() => null);
    if (!randevu) {
      throw new NotFoundException({ message: 'Randevu bulunamadı.' });
    }
    if (randevu.status === 'tamamlandi') {
      throw new BadRequestException({
        message: 'Tamamlanmış randevu güncellenemez.',
      });
    }

    randevu.status = govde.status;
    await randevu.save();
    return { id: randevu._id.toString(), status: randevu.status };
  }
}
