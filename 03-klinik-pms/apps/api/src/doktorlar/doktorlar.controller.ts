import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Appointment, AppointmentDocument, Doctor, DoctorDocument, User, UserDocument,
} from '../schemas';
import { JwtGuard } from '../auth/jwt.guard';
import { gunBasi, gunSonu } from '../tarih';

@Controller('api/doctors')
@UseGuards(JwtGuard)
export class DoktorlarController {
  constructor(
    @InjectModel(Doctor.name) private doktorlar: Model<DoctorDocument>,
    @InjectModel(User.name) private kullanicilar: Model<UserDocument>,
    @InjectModel(Appointment.name) private randevular: Model<AppointmentDocument>,
  ) {}

  @Get()
  async listele() {
    const liste = await this.doktorlar.find({ isActive: true }).sort({ branch: 1 });

    const cevap = [];
    for (const d of liste) {
      const kullanici = await this.kullanicilar.findById(d.userId);
      cevap.push({
        id: d._id.toString(),
        full_name: kullanici?.fullName,
        branch: d.branch,
        examination_fee: Number(d.examinationFee),
      });
    }
    return cevap;
  }

  // Bir doktorun belirli gündeki boş randevu saatleri
  @Get(':id/slots')
  async bosSaatler(@Param('id') id: string, @Query('date') tarih: string) {
    const bas = gunBasi(tarih || undefined);
    const bit = gunSonu(tarih || undefined);

    const doluRandevular = await this.randevular.find({
      doctorId: id,
      startsAt: { $gte: bas, $lt: bit },
    });

    // İptal edilen randevunun saati tekrar açılır
    const doluSaatler = doluRandevular
      .filter((r) => r.status !== 'iptal')
      .map((r) => new Date(r.startsAt).getHours() * 60 + new Date(r.startsAt).getMinutes());

    // Klinik 09:00 - 17:00, 20 dakikalık slotlar
    const slotlar: { time: string; available: boolean }[] = [];
    for (let dakika = 9 * 60; dakika < 17 * 60; dakika += 20) {
      const saat = Math.floor(dakika / 60);
      const dk = dakika % 60;
      slotlar.push({
        time: String(saat).padStart(2, '0') + ':' + String(dk).padStart(2, '0'),
        available: !doluSaatler.includes(dakika),
      });
    }

    return { date: tarih, doctor_id: id, slots: slotlar };
  }
}
