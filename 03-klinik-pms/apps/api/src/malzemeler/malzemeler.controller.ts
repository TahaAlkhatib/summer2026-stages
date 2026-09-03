import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Supply, SupplyDocument } from '../schemas';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/supplies')
@UseGuards(JwtGuard)
export class MalzemelerController {
  constructor(@InjectModel(Supply.name) private malzemeler: Model<SupplyDocument>) {}

  @Get()
  async listele(@Query('q') q: string, @Query('lowStock') kritik: string) {
    const desen = q ? new RegExp(q, 'i') : null;
    const filtre = desen ? { $or: [{ name: desen }, { code: desen }] } : {};

    let liste = await this.malzemeler.find(filtre).sort({ name: 1 });

    if (kritik === '1') {
      liste = liste.filter((m) => m.stockQuantity <= m.minStock);
    }

    return liste.map((m) => ({
      id: m._id.toString(),
      code: m.code,
      name: m.name,
      unit: m.unit,
      unit_price: Number(m.unitPrice),
      stock_quantity: m.stockQuantity,
      min_stock: m.minStock,
      is_low: m.stockQuantity <= m.minStock,
    }));
  }

  @Post()
  async ekle(@Body() govde: any, @Req() istek: any) {
    if (istek.user?.role !== 'admin') {
      throw new BadRequestException({ message: 'Bu işlem için yetkiniz yok.' });
    }
    if (!govde.code || !govde.name) {
      throw new BadRequestException({ message: 'Malzeme kodu ve adı zorunludur.' });
    }

    const mevcut = await this.malzemeler.findOne({ code: govde.code });
    if (mevcut) {
      throw new BadRequestException({ message: 'Bu malzeme kodu zaten kayıtlı.' });
    }

    return this.malzemeler.create({
      code: govde.code,
      name: govde.name,
      unit: govde.unit,
      unitPrice: govde.unitPrice,
      stockQuantity: govde.stockQuantity,
      minStock: govde.minStock,
    });
  }

  // Depoya mal girişi
  @Put(':id/stock-in')
  async stokGirisi(
    @Param('id') id: string,
    @Body() govde: { quantity: number },
    @Req() istek: any,
  ) {
    if (istek.user?.role !== 'admin') {
      throw new BadRequestException({ message: 'Bu işlem için yetkiniz yok.' });
    }

    const malzeme = await this.malzemeler.findById(id).catch(() => null);
    if (!malzeme) {
      throw new NotFoundException({ message: 'Malzeme bulunamadı.' });
    }
    if (!govde.quantity || govde.quantity <= 0) {
      throw new BadRequestException({ message: 'Giriş miktarı sıfırdan büyük olmalıdır.' });
    }

    malzeme.stockQuantity += Number(govde.quantity);
    await malzeme.save();
    return { id: malzeme._id.toString(), stock_quantity: malzeme.stockQuantity };
  }
}
