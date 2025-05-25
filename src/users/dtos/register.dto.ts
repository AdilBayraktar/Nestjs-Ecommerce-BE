import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
  username: string;
  @IsString({ message: 'Email must be a string' })
  @Length(3, 150, { message: 'Email must be between 3 and 150 characters' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
