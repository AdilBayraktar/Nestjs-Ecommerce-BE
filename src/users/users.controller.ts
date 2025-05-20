import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('/api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  public getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
