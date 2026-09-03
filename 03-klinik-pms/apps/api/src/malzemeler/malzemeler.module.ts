import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Supply, SupplySchema } from '../schemas';
import { MalzemelerController } from './malzemeler.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Supply.name, schema: SupplySchema }])],
  controllers: [MalzemelerController],
})
export class MalzemelerModule {}
