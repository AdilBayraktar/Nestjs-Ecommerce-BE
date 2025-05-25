import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import e from 'express';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { JWTPayloadType } from 'src/utils/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<e.Request>();
    const authHeader = request.headers['authorization'];
    const [type, token] = typeof authHeader === 'string' ? authHeader.split(' ') : [undefined, undefined];
    if (token && type === 'Bearer') {
      try {
        const payload: JWTPayloadType = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        request[CURRENT_USER_KEY] = payload;
      } catch (error) {
        throw new UnauthorizedException('Access denied. Invalid token.');
      }
    } else {
      throw new UnauthorizedException('Access denied. No token provided.');
    }
    return true;
  }
}
