import {
  BadRequestException, Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../entities';
import { JwtGuard } from './jwt.guard';

@Controller('api/auth')
export class AuthController {
  constructor(
    @InjectRepository(User) private kullanicilar: Repository<User>,
    private jwt: JwtService,
  ) {}

  @Post('login')
  async login(@Body() govde: { username: string; password: string }) {
    if (!govde.username || !govde.password) {
      throw new BadRequestException({
        message: 'Kullanıcı adı ve şifre zorunludur.',
      });
    }

    const kullanici = await this.kullanicilar.findOne({
      where: { username: govde.username, isActive: true },
    });

    if (!kullanici || !bcrypt.compareSync(govde.password, kullanici.passwordHash)) {
      throw new UnauthorizedException({
        message: 'Kullanıcı adı veya şifre hatalı.',
      });
    }

    const token = await this.jwt.signAsync({
      id: kullanici.id,
      username: kullanici.username,
      role: kullanici.role,
      full_name: kullanici.fullName,
    });

    return {
      token,
      user: {
        id: kullanici.id,
        full_name: kullanici.fullName,
        username: kullanici.username,
        role: kullanici.role,
      },
    };
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@Req() istek: any) {
    return istek.user;
  }
}
