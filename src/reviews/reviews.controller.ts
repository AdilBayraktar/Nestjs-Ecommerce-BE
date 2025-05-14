import { Controller, Get } from '@nestjs/common';

@Controller()
export class ReviewsController {
  @Get('/api/v1/reviews')
  public getAllReviews() {
    return [
      { id: 1, productId: 1, review: 'Great product!' },
      { id: 2, productId: 2, review: 'Not bad' },
      { id: 3, productId: 3, review: 'Could be better' },
    ];
  }
}
