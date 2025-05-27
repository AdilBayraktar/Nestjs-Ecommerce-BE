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

  /**
   * Creates a new review for a product by a user.
   * @param productId - The ID of the product being reviewed.
   * @param userId - The ID of the user creating the review.
   * @param dto - The data transfer object containing review details.
   * @returns The created review details.
   * @access private
   * @throws ForbiddenException if the user is trying to review their own product.
   */
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

  /**
   * Retrieves all reviews with pagination.
   * @param pageNumber - The page number for pagination.
   * @param pageSize - The number of reviews per page.
   * @returns A list of reviews with pagination.
   * @access public
   */
  public async getAllReviews(pageNumber: number, pageSize: number) {
    const reviews = await this.reviewsRepository.find({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => ({
      id: review.id,
      comment: review.comment,
      rating: review.rating,
      productId: review.product.id,
      userId: review.user.id,
      createdAt: review.createdAt,
    }));
  }

  /**
   * Retrieves all reviews made by a specific user.
   * @param userId - The ID of the user whose reviews are to be fetched.
   * @returns A list of reviews made by the user.
   * @access private
   */
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

  /**
   * Retrieves all reviews for a specific product.
   * @param productId - The ID of the product whose reviews are to be fetched.
   * @returns A list of reviews for the product.
   * @access public
   */
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

  /**
   * Retrieves a review by its ID.
   * @param id - The ID of the review to be fetched.
   * @returns The review details.
   * @access public
   * @throws NotFoundException if the review does not exist.
   */
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

  /**
   * Updates an existing review.
   * @param reviewId - The ID of the review to be updated.
   * @param userId - The ID of the user updating the review.
   * @param dto - The data transfer object containing updated review details.
   * @returns The updated review details.
   * @access private
   * @throws NotFoundException if the review does not exist.
   * @throws ForbiddenException if the user is not the owner of the review.
   */
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

  /**
   * Deletes a review by its ID.
   * @param reviewId - The ID of the review to be deleted.
   * @param userId - The ID of the user deleting the review.
   * @returns A success message if deletion is successful.
   * @access private
   * @throws NotFoundException if the review does not exist.
   * @throws ForbiddenException if the user is not the owner of the review.
   */
  public async deleteReview(reviewId: number, userId: number) {
    const review = await this.getReviewById(reviewId);
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    await this.reviewsRepository.delete(reviewId);
    return { message: 'Review deleted successfully' };
  }
}
