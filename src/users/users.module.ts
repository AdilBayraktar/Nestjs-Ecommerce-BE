import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
})
export class UsersModule {
  constructor() {
    console.log('Reviews module loaded');
  }
}
