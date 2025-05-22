import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateProductDTO {
  @IsString({ message: 'Product title must be a string' })
  @IsNotEmpty({ message: 'Product title is required' })
  @Length(3, 150, { message: 'Product title must be between 3 and 150 characters' })
  name: string;

  @IsString({ message: 'Product description must be a string' })
  @IsNotEmpty({ message: 'Product description is required' })
  @Length(3, 500, { message: 'Product description must be between 3 and 500 characters' })
  description: string;

  @IsOptional()
  ImageUrl: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be a positive number' })
  @Max(100000, { message: 'Price must be at most 100000' })
  price: number;
}
