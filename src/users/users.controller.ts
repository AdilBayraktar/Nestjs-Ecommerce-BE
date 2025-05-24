import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from './users.service';
import { LoginDto } from './dtos/login.dto';

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
}
