import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Appointment, MedicalRecord, Prescription, Supply, SupplyUsage,
} from '../entities';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/records')
@UseGuards(JwtGuard)
export class KayitlarController {
  constructor(
    @InjectRepository(MedicalRecord) private kayitlar: Repository<MedicalRecord>,
    @InjectRepository(Prescription) private receteler: Repository<Prescription>,
    @InjectRepository(Appointment) private randevular: Repository<Appointment>,
    @InjectRepository(Supply) private malzemeler: Repository<Supply>,
    @InjectRepository(SupplyUsage) private kullanimlar: Repository<SupplyUsage>,
  ) {}

  // Bir hastanın tüm muayene kayıtları
  @Get()
  async listele(@Query('patientId') hastaId: string) {
    if (!hastaId) {
      throw new BadRequestException({ message: 'Hasta seçilmelidir.' });
    }

    const liste = await this.kayitlar.find({
      where: { patientId: Number(hastaId) },
      relations: { prescriptions: true, appointment: { doctor: { user: true } } },
      order: { createdAt: 'DESC' },
    });

    return liste.map((k) => ({
      id: k.id,
      complaint: k.complaint,
      diagnosis: k.diagnosis,
      treatment_note: k.treatmentNote,
      created_at: k.createdAt,
      doctor_name: k.appointment?.doctor?.user?.fullName,
      branch: k.appointment?.doctor?.branch,
      prescriptions: k.prescriptions?.map((r) => ({
        id: r.id,
        medicine_name: r.medicineName,
        dosage: r.dosage,
        days: r.days,
        note: r.note,
      })),
    }));
  }

  @Get(':id')
  async getir(@Param('id') id: number) {
    const kayit = await this.kayitlar.findOne({
      where: { id },
      relations: {
        prescriptions: true,
        supplyUsages: { supply: true },
        appointment: { patient: true, doctor: { user: true } },
      },
    });
    if (!kayit) {
      throw new NotFoundException({ message: 'Muayene kaydı bulunamadı.' });
    }
    return kayit;
  }

  // Muayene kaydı oluştur — randevu tamamlandı olarak işaretlenir
  @Post()
  async olustur(@Body() govde: any) {
    if (!govde.appointmentId) {
      throw new BadRequestException({ message: 'Randevu seçilmelidir.' });
    }
    if (!govde.complaint || govde.complaint.trim() === '') {
      throw new BadRequestException({ message: 'Hasta şikayeti yazılmalıdır.' });
    }

    const randevu = await this.randevular.findOne({ where: { id: govde.appointmentId } });
    if (!randevu) {
      throw new BadRequestException({ message: 'Randevu bulunamadı.' });
    }

    const mevcut = await this.kayitlar.findOne({
      where: { appointmentId: govde.appointmentId },
    });
    if (mevcut) {
      throw new BadRequestException({
        message: 'Bu randevu için muayene kaydı zaten oluşturulmuş.',
      });
    }

    const kayit = this.kayitlar.create({
      appointmentId: randevu.id,
      patientId: randevu.patientId,
      doctorId: randevu.doctorId,
      complaint: govde.complaint,
      diagnosis: govde.diagnosis,
      treatmentNote: govde.treatmentNote,
    });
    await this.kayitlar.save(kayit);

    // Muayene yapıldıysa randevu tamamlandı sayılır
    randevu.status = 'tamamlandi';
    await this.randevular.save(randevu);

    // Reçete kalemleri geldiyse kaydet
    if (Array.isArray(govde.prescriptions)) {
      for (const r of govde.prescriptions) {
        if (!r.medicineName || !r.dosage) {
          continue;
        }
        await this.receteler.save(
          this.receteler.create({
            recordId: kayit.id,
            medicineName: r.medicineName,
            dosage: r.dosage,
            days: r.days || 7,
            note: r.note,
          }),
        );
      }
    }

    return { id: kayit.id, appointment_id: randevu.id };
  }

  // Muayenede kullanılan sarf malzemesi — stoktan düşer
  @Post(':id/supplies')
  async malzemeKullan(
    @Param('id') id: number,
    @Body() govde: { supplyId: number; quantity: number },
  ) {
    const kayit = await this.kayitlar.findOne({ where: { id } });
    if (!kayit) {
      throw new NotFoundException({ message: 'Muayene kaydı bulunamadı.' });
    }

    const malzeme = await this.malzemeler.findOne({ where: { id: govde.supplyId } });
    if (!malzeme) {
      throw new BadRequestException({ message: 'Malzeme bulunamadı.' });
    }
    if (!govde.quantity || govde.quantity <= 0) {
      throw new BadRequestException({ message: 'Miktar sıfırdan büyük olmalıdır.' });
    }
    if (malzeme.stockQuantity < govde.quantity) {
      throw new BadRequestException({
        message: 'Stok yetersiz. Depoda ' + malzeme.stockQuantity + ' ' + malzeme.unit + ' var.',
      });
    }

    const kullanim = this.kullanimlar.create({
      recordId: id,
      supplyId: malzeme.id,
      quantity: govde.quantity,
    });
    await this.kullanimlar.save(kullanim);

    malzeme.stockQuantity -= govde.quantity;
    await this.malzemeler.save(malzeme);

    return {
      id: kullanim.id,
      name: malzeme.name,
      remaining_stock: malzeme.stockQuantity,
    };
  }
}
