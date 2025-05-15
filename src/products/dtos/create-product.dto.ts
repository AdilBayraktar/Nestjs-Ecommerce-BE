import { IsNotEmpty, IsNumber, IsString, Length, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductDTO {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 150, { message: 'Name must be between 3 and 150 characters' })
  name: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be a positive number' })
  @Max(100000, { message: 'Price must be at most 100000' })
  price: number;
}
