import {
  BadRequestException, Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../schemas';
import { JwtGuard } from './jwt.guard';

@Controller('api/auth')
export class AuthController {
  constructor(
    @InjectModel(User.name) private kullanicilar: Model<UserDocument>,
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
      username: govde.username,
      isActive: true,
    });

    if (!kullanici || !bcrypt.compareSync(govde.password, kullanici.passwordHash)) {
      throw new UnauthorizedException({
        message: 'Kullanıcı adı veya şifre hatalı.',
      });
    }

    const token = await this.jwt.signAsync({
      id: kullanici._id.toString(),
      username: kullanici.username,
      role: kullanici.role,
      full_name: kullanici.fullName,
    });

    return {
      token,
      user: {
        id: kullanici._id.toString(),
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
