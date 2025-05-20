import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewsService {
  public getAllReviews() {
    return [
      { id: 1, productId: 1, review: 'Great product!' },
      { id: 2, productId: 2, review: 'Not bad' },
      { id: 3, productId: 3, review: 'Could be better' },
    ];
  }
}
