import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Appointment, Doctor } from '../entities';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/doctors')
@UseGuards(JwtGuard)
export class DoktorlarController {
  constructor(
    @InjectRepository(Doctor) private doktorlar: Repository<Doctor>,
    @InjectRepository(Appointment) private randevular: Repository<Appointment>,
  ) {}

  @Get()
  async listele() {
    const liste = await this.doktorlar.find({
      where: { isActive: true },
      relations: { user: true },
      order: { branch: 'ASC' },
    });

    return liste.map((d) => ({
      id: d.id,
      full_name: d.user?.fullName,
      branch: d.branch,
      examination_fee: Number(d.examinationFee),
    }));
  }

  // Bir doktorun belirli gündeki boş randevu saatleri
  @Get(':id/slots')
  async bosSaatler(@Param('id') id: number, @Query('date') tarih: string) {
    const gun = tarih ? new Date(tarih + 'T00:00:00') : new Date();
    gun.setHours(0, 0, 0, 0);
    const gunSonu = new Date(gun);
    gunSonu.setDate(gunSonu.getDate() + 1);

    const doluRandevular = await this.randevular.find({
      where: { doctorId: id, startsAt: Between(gun, gunSonu) },
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

    return { date: tarih, doctor_id: Number(id), slots: slotlar };
  }
}
