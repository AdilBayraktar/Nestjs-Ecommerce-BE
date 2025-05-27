import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { CreateReviewDto } from './dtos/create-review.dto';
import { JWTPayloadType } from 'src/utils/types';
import { AuthGuard } from 'src/users/guards/auth.guard';

@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  public getAllReviews() {
    return this.reviewsService.getAllReviews();
  }

  @Post(':productId')
  @UseGuards(AuthGuard)
  public createReview(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(productId, payload.id, body);
  }

  @Get('/users/:userId')
  @UseGuards(AuthGuard)
  public getAllReviewsByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.getAllReviewsByUser(userId);
  }

  @Get('/products/:productId')
  @UseGuards(AuthGuard)
  public getAllReviewsByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getAllReviewsByProduct(productId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  public getSingleReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getReviewById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  public async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.reviewsService.updateReview(id, payload.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  public async deleteReview(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayloadType) {
    return this.reviewsService.deleteReview(id, payload.id);
  }
}
