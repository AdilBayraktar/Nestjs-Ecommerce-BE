import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import e from 'express';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { UserType } from 'src/utils/enums';
import { JWTPayloadType } from 'src/utils/types';
import { UsersService } from '../users.service';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: UserType[] = this.reflector.getAllAndOverride('roles', [context.getHandler(), context.getClass()]);

    if (!roles || roles.length === 0) {
      return false;
    }

    const request = context.switchToHttp().getRequest<e.Request>();
    const authHeader = request.headers['authorization'];
    const [type, token] = typeof authHeader === 'string' ? authHeader.split(' ') : [undefined, undefined];

    if (token && type === 'Bearer') {
      try {
        const payload: JWTPayloadType = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });

        const user = await this.userService.getCurrentUser(payload.id);
        if (!user || !roles.includes(user.userType)) {
          return false;
        }
        request[CURRENT_USER_KEY] = payload;
        return true;
      } catch (error) {
        throw new UnauthorizedException('Access denied. Invalid token.');
      }
    } else {
      throw new UnauthorizedException('Access denied. No token provided.');
    }
  }
}
