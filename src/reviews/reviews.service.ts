import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CreateReviewDto } from './dtos/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewsRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  public async createReview(productId: number, userId: number, dto: CreateReviewDto) {
    const product = await this.productsService.getSingleProduct(productId);
    const user = await this.usersService.getCurrentUser(userId);

    // Prevent product owner from reviewing their own product
    if (product.user.id === user.id) {
      throw new ForbiddenException('You cannot review your own product.');
    }

    // Prevent duplicate reviews by the same user on the same product
    const existingReview = await this.reviewsRepository.findOne({
      where: {
        product: { id: productId },
        user: { id: userId },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product.');
    }

    const newReview = this.reviewsRepository.create({
      ...dto,
      product,
      user,
    });

    const result = await this.reviewsRepository.save(newReview);

    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      productId: result.product.id,
      userId: result.user.id,
      createdAt: result.createdAt,
    };
  }

  public async getAllReviewsByUser(userId: number) {
    const reviews = await this.reviewsRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      comment: review.comment,
      rating: review.rating,
      productId: review.product.id,
      createdAt: review.createdAt,
      userId: review.user.id,
    }));
  }

  public async getAllReviewsByProduct(productId: number) {
    const reviews = await this.reviewsRepository.find({
      where: { product: { id: productId } },
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      comment: review.comment,
      rating: review.rating,
      userId: review.user.id,
      productId: review.product.id,
      createdAt: review.createdAt,
    }));
  }

  public async getReviewById(id: number) {
    const result = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!result) {
      throw new NotFoundException('Review not found');
    }

    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      productId: result.product.id,
      userId: result.user.id,
      createdAt: result.createdAt,
    };
  }

  public async updateReview(reviewId: number, userId: number, dto: CreateReviewDto) {
    const review = await this.getReviewById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }
    review.comment = dto.comment ?? review.comment;
    review.rating = dto.rating ?? review.rating;

    const updated = await this.reviewsRepository.save(review);
    console.log(updated);
    return {
      id: updated.id,
      comment: updated.comment,
      rating: updated.rating,
      productId: updated.productId,
      userId: updated.userId,
      createdAt: updated.createdAt,
    };
  }

  public async deleteReview(reviewId: number, userId: number) {
    const review = await this.getReviewById(reviewId);
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    await this.reviewsRepository.delete(reviewId);
    return { message: 'Review deleted successfully' };
  }
}
