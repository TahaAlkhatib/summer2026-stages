import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'klinik_gizli_anahtar_2026',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
