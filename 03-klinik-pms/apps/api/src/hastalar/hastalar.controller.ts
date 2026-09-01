import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Appointment, Patient } from '../entities';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/patients')
@UseGuards(JwtGuard)
export class HastalarController {
  constructor(
    @InjectRepository(Patient) private hastalar: Repository<Patient>,
    @InjectRepository(Appointment) private randevular: Repository<Appointment>,
  ) {}

  // Hasta arama — ad, telefon veya TC kimlik numarası
  @Get()
  async listele(@Query('q') q: string) {
    if (q && q.trim() !== '') {
      const arama = '%' + q.trim() + '%';
      return this.hastalar.find({
        where: [
          { fullName: ILike(arama) },
          { phone: ILike(arama) },
          { nationalId: ILike(arama) },
        ],
        order: { fullName: 'ASC' },
      });
    }
    return this.hastalar.find({ order: { fullName: 'ASC' }, take: 100 });
  }

  @Get(':id')
  async getir(@Param('id') id: number) {
    const hasta = await this.hastalar.findOne({ where: { id } });
    if (!hasta) {
      throw new NotFoundException({ message: 'Hasta bulunamadı.' });
    }

    const gecmisRandevular = await this.randevular.find({
      where: { patientId: id },
      relations: { doctor: { user: true } },
      order: { startsAt: 'DESC' },
    });

    return {
      ...hasta,
      appointments: gecmisRandevular.map((r) => ({
        id: r.id,
        starts_at: r.startsAt,
        status: r.status,
        doctor_name: r.doctor?.user?.fullName,
        branch: r.doctor?.branch,
      })),
    };
  }

  @Post()
  async ekle(@Body() govde: Partial<Patient>) {
    if (!govde.fullName || !govde.phone) {
      throw new BadRequestException({ message: 'Ad soyad ve telefon zorunludur.' });
    }
    if (!govde.nationalId || govde.nationalId.length !== 11) {
      throw new BadRequestException({ message: 'TC kimlik numarası 11 haneli olmalıdır.' });
    }

    const mevcut = await this.hastalar.findOne({ where: { nationalId: govde.nationalId } });
    if (mevcut) {
      throw new BadRequestException({ message: 'Bu TC kimlik numarası zaten kayıtlı.' });
    }

    const hasta = this.hastalar.create(govde);
    await this.hastalar.save(hasta);
    return hasta;
  }

  @Put(':id')
  async guncelle(@Param('id') id: number, @Body() govde: Partial<Patient>) {
    const hasta = await this.hastalar.findOne({ where: { id } });
    if (!hasta) {
      throw new NotFoundException({ message: 'Hasta bulunamadı.' });
    }
    if (!govde.fullName || !govde.phone) {
      throw new BadRequestException({ message: 'Ad soyad ve telefon zorunludur.' });
    }

    hasta.fullName = govde.fullName;
    hasta.phone = govde.phone;
    hasta.birthDate = govde.birthDate ?? hasta.birthDate;
    hasta.gender = govde.gender ?? hasta.gender;
    hasta.bloodType = govde.bloodType ?? hasta.bloodType;
    hasta.allergies = govde.allergies ?? hasta.allergies;
    hasta.address = govde.address ?? hasta.address;

    await this.hastalar.save(hasta);
    return hasta;
  }
}
