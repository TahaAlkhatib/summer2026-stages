import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Appointment, AppointmentDocument, Doctor, DoctorDocument,
  Patient, PatientDocument, User, UserDocument,
} from '../schemas';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/patients')
@UseGuards(JwtGuard)
export class HastalarController {
  constructor(
    @InjectModel(Patient.name) private hastalar: Model<PatientDocument>,
    @InjectModel(Appointment.name) private randevular: Model<AppointmentDocument>,
    @InjectModel(Doctor.name) private doktorlar: Model<DoctorDocument>,
    @InjectModel(User.name) private kullanicilar: Model<UserDocument>,
  ) {}

  // Hasta arama — ad, telefon veya TC kimlik numarası
  @Get()
  async listele(@Query('q') q: string) {
    if (q && q.trim() !== '') {
      // Büyük/küçük harf duyarsız arama düzenli ifade (regex) ile yapılır
      const desen = new RegExp(q.trim(), 'i');
      return this.hastalar
        .find({ $or: [{ fullName: desen }, { phone: desen }, { nationalId: desen }] })
        .sort({ fullName: 1 });
    }
    return this.hastalar.find().sort({ fullName: 1 }).limit(100);
  }

  @Get(':id')
  async getir(@Param('id') id: string) {
    const hasta = await this.hastalar.findById(id).catch(() => null);
    if (!hasta) {
      throw new NotFoundException({ message: 'Hasta bulunamadı.' });
    }

    const gecmisRandevular = await this.randevular
      .find({ patientId: hasta._id })
      .sort({ startsAt: -1 });

    const cevap: any = hasta.toJSON();
    cevap.appointments = [];

    for (const r of gecmisRandevular) {
      const doktor = await this.doktorlar.findById(r.doctorId);
      const kullanici = doktor ? await this.kullanicilar.findById(doktor.userId) : null;

      cevap.appointments.push({
        id: r._id.toString(),
        starts_at: r.startsAt,
        status: r.status,
        doctor_name: kullanici?.fullName,
        branch: doktor?.branch,
      });
    }

    return cevap;
  }

  @Post()
  async ekle(@Body() govde: any) {
    if (!govde.fullName || !govde.phone) {
      throw new BadRequestException({ message: 'Ad soyad ve telefon zorunludur.' });
    }
    if (!govde.nationalId || govde.nationalId.length !== 11) {
      throw new BadRequestException({ message: 'TC kimlik numarası 11 haneli olmalıdır.' });
    }

    const mevcut = await this.hastalar.findOne({ nationalId: govde.nationalId });
    if (mevcut) {
      throw new BadRequestException({ message: 'Bu TC kimlik numarası zaten kayıtlı.' });
    }

    return this.hastalar.create({
      nationalId: govde.nationalId,
      fullName: govde.fullName,
      phone: govde.phone,
      birthDate: govde.birthDate,
      gender: govde.gender,
      bloodType: govde.bloodType,
      allergies: govde.allergies,
      address: govde.address,
    });
  }

  @Put(':id')
  async guncelle(@Param('id') id: string, @Body() govde: any) {
    const hasta = await this.hastalar.findById(id).catch(() => null);
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

    await hasta.save();
    return hasta;
  }
}
