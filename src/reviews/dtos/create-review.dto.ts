import { IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1, { message: 'Product ID must be a positive number' })
  @Max(5, { message: 'Product ID must be at most 5 digits' })
  rating: number;

  @IsString()
  @IsOptional()
  @Length(1, 1000, { message: 'Comment must be between 1 and 1000 characters' })
  comment: string;
}
