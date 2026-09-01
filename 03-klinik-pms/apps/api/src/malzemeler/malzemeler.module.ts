import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supply } from '../entities';
import { MalzemelerController } from './malzemeler.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supply])],
  controllers: [MalzemelerController],
})
export class MalzemelerModule {}
