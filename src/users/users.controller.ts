import { Controller, Get } from '@nestjs/common';

@Controller()
export class UsersController {
  @Get('/api/v1/users')
  public getAllUsers() {
    return [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
      { id: 3, name: 'User 3' },
    ];
  }
}
