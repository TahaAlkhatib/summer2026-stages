import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Appointment, AppointmentDocument, Doctor, DoctorDocument,
  MedicalRecord, MedicalRecordDocument, Patient, PatientDocument,
  Prescription, PrescriptionDocument, Supply, SupplyDocument,
  SupplyUsage, SupplyUsageDocument, User, UserDocument,
} from '../schemas';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/records')
@UseGuards(JwtGuard)
export class KayitlarController {
  constructor(
    @InjectModel(MedicalRecord.name) private kayitlar: Model<MedicalRecordDocument>,
    @InjectModel(Prescription.name) private receteler: Model<PrescriptionDocument>,
    @InjectModel(Appointment.name) private randevular: Model<AppointmentDocument>,
    @InjectModel(Supply.name) private malzemeler: Model<SupplyDocument>,
    @InjectModel(SupplyUsage.name) private kullanimlar: Model<SupplyUsageDocument>,
    @InjectModel(Doctor.name) private doktorlar: Model<DoctorDocument>,
    @InjectModel(Patient.name) private hastalar: Model<PatientDocument>,
    @InjectModel(User.name) private kullanicilar: Model<UserDocument>,
  ) {}

  // Bir hastanın tüm muayene kayıtları
  @Get()
  async listele(@Query('patientId') hastaId: string) {
    if (!hastaId) {
      throw new BadRequestException({ message: 'Hasta seçilmelidir.' });
    }

    const liste = await this.kayitlar
      .find({ patientId: hastaId })
      .sort({ createdAt: -1 })
      .catch(() => []);

    const cevap = [];
    for (const k of liste) {
      const receteler = await this.receteler.find({ recordId: k._id });
      const doktor = await this.doktorlar.findById(k.doctorId);
      const doktorKullanici = doktor ? await this.kullanicilar.findById(doktor.userId) : null;

      cevap.push({
        id: k._id.toString(),
        complaint: k.complaint,
        diagnosis: k.diagnosis,
        treatment_note: k.treatmentNote,
        created_at: k.createdAt,
        doctor_name: doktorKullanici?.fullName,
        branch: doktor?.branch,
        prescriptions: receteler.map((r) => ({
          id: r._id.toString(),
          medicine_name: r.medicineName,
          dosage: r.dosage,
          days: r.days,
          note: r.note,
        })),
      });
    }

    return cevap;
  }

  @Get(':id')
  async getir(@Param('id') id: string) {
    const kayit = await this.kayitlar.findById(id).catch(() => null);
    if (!kayit) {
      throw new NotFoundException({ message: 'Muayene kaydı bulunamadı.' });
    }

    const hasta = await this.hastalar.findById(kayit.patientId);
    const doktor = await this.doktorlar.findById(kayit.doctorId);
    const doktorKullanici = doktor ? await this.kullanicilar.findById(doktor.userId) : null;
    const randevu = await this.randevular.findById(kayit.appointmentId);
    const receteler = await this.receteler.find({ recordId: kayit._id });
    const kullanimlar = await this.kullanimlar.find({ recordId: kayit._id });

    // Kullanılan malzemelerin adını da ekliyoruz
    const kullanimListesi = [];
    for (const k of kullanimlar) {
      const malzeme = await this.malzemeler.findById(k.supplyId);
      kullanimListesi.push({ ...k.toJSON(), supply: malzeme ? malzeme.toJSON() : null });
    }

    const cevap: any = kayit.toJSON();
    cevap.prescriptions = receteler.map((r) => r.toJSON());
    cevap.supplyUsages = kullanimListesi;
    cevap.appointment = randevu
      ? {
          ...randevu.toJSON(),
          patient: hasta ? hasta.toJSON() : null,
          doctor: doktor
            ? { ...doktor.toJSON(), user: doktorKullanici ? doktorKullanici.toJSON() : null }
            : null,
        }
      : null;
    return cevap;
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

    const randevu = await this.randevular.findById(govde.appointmentId).catch(() => null);
    if (!randevu) {
      throw new BadRequestException({ message: 'Randevu bulunamadı.' });
    }

    const mevcut = await this.kayitlar.findOne({ appointmentId: randevu._id });
    if (mevcut) {
      throw new BadRequestException({
        message: 'Bu randevu için muayene kaydı zaten oluşturulmuş.',
      });
    }

    const kayit = await this.kayitlar.create({
      appointmentId: randevu._id,
      patientId: randevu.patientId,
      doctorId: randevu.doctorId,
      complaint: govde.complaint,
      diagnosis: govde.diagnosis,
      treatmentNote: govde.treatmentNote,
    });

    // Muayene yapıldıysa randevu tamamlandı sayılır
    randevu.status = 'tamamlandi';
    await randevu.save();

    // Reçete kalemleri geldiyse kaydet
    if (Array.isArray(govde.prescriptions)) {
      for (const r of govde.prescriptions) {
        if (!r.medicineName || !r.dosage) {
          continue;
        }
        await this.receteler.create({
          recordId: kayit._id,
          medicineName: r.medicineName,
          dosage: r.dosage,
          days: r.days || 7,
          note: r.note,
        });
      }
    }

    return { id: kayit._id.toString(), appointment_id: randevu._id.toString() };
  }

  // Muayenede kullanılan sarf malzemesi — stoktan düşer
  @Post(':id/supplies')
  async malzemeKullan(
    @Param('id') id: string,
    @Body() govde: { supplyId: string; quantity: number },
  ) {
    const kayit = await this.kayitlar.findById(id).catch(() => null);
    if (!kayit) {
      throw new NotFoundException({ message: 'Muayene kaydı bulunamadı.' });
    }

    const malzeme = await this.malzemeler.findById(govde.supplyId).catch(() => null);
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

    const kullanim = await this.kullanimlar.create({
      recordId: kayit._id,
      supplyId: malzeme._id,
      quantity: govde.quantity,
    });

    malzeme.stockQuantity -= Number(govde.quantity);
    await malzeme.save();

    return {
      id: kullanim._id.toString(),
      name: malzeme.name,
      remaining_stock: malzeme.stockQuantity,
    };
  }
}
