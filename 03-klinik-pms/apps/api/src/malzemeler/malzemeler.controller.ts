import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Supply } from '../entities';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/supplies')
@UseGuards(JwtGuard)
export class MalzemelerController {
  constructor(@InjectRepository(Supply) private malzemeler: Repository<Supply>) {}

  @Get()
  async listele(@Query('q') q: string, @Query('lowStock') kritik: string) {
    let liste = await this.malzemeler.find({
      where: q ? [{ name: ILike('%' + q + '%') }, { code: ILike('%' + q + '%') }] : {},
      order: { name: 'ASC' },
    });

    if (kritik === '1') {
      liste = liste.filter((m) => m.stockQuantity <= m.minStock);
    }

    return liste.map((m) => ({
      id: m.id,
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

    const mevcut = await this.malzemeler.findOne({ where: { code: govde.code } });
    if (mevcut) {
      throw new BadRequestException({ message: 'Bu malzeme kodu zaten kayıtlı.' });
    }

    const malzeme = this.malzemeler.create(govde as Partial<Supply>);
    await this.malzemeler.save(malzeme);
    return malzeme;
  }

  // Depoya mal girişi
  @Put(':id/stock-in')
  async stokGirisi(
    @Param('id') id: number,
    @Body() govde: { quantity: number },
    @Req() istek: any,
  ) {
    if (istek.user?.role !== 'admin') {
      throw new BadRequestException({ message: 'Bu işlem için yetkiniz yok.' });
    }

    const malzeme = await this.malzemeler.findOne({ where: { id } });
    if (!malzeme) {
      throw new NotFoundException({ message: 'Malzeme bulunamadı.' });
    }
    if (!govde.quantity || govde.quantity <= 0) {
      throw new BadRequestException({ message: 'Giriş miktarı sıfırdan büyük olmalıdır.' });
    }

    malzeme.stockQuantity += govde.quantity;
    await this.malzemeler.save(malzeme);
    return { id: malzeme.id, stock_quantity: malzeme.stockQuantity };
  }
}
