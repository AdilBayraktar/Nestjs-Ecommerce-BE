import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from './users.service';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { JWTPayloadType } from 'src/utils/types';
import { CurrentUser } from './decorators/current-user-decorator';

@Controller('/api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  public async register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @Get('/current-user')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard) // Assuming you have an AuthGuard implemented
  public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }
}
