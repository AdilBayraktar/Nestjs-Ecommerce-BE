import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Email must be a string' })
  @Length(3, 150, { message: 'Email must be between 3 and 150 characters' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  constructor() {
    this.email = '';
    this.password = '';
  }
}
