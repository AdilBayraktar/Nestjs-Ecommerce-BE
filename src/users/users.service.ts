import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  public getAllUsers() {
    return [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
      { id: 3, name: 'User 3' },
    ];
  }
}
