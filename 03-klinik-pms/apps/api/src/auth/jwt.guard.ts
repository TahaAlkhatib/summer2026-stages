import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Authorization: Bearer <token> başlığını doğrular ve req.user'ı doldurur
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const istek = context.switchToHttp().getRequest();
    const baslik = istek.headers['authorization'];

    if (!baslik || !baslik.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        message: 'Oturum geçersiz, lütfen tekrar giriş yapın.',
      });
    }

    try {
      istek.user = await this.jwt.verifyAsync(baslik.substring(7));
      return true;
    } catch {
      throw new UnauthorizedException({
        message: 'Oturum geçersiz, lütfen tekrar giriş yapın.',
      });
    }
  }
}
