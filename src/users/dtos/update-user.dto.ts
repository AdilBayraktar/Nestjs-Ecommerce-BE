import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
  username?: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsOptional()
  password?: string;
}
