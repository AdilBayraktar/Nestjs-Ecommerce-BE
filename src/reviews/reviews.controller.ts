import { Controller, Get } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  public getAllReviews() {
    return this.reviewsService.getAllReviews();
  }
}
