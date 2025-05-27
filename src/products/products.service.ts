import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { UpdateProductDTO } from './dtos/update-product.dto';
import { Between, Like, Repository } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Retrieves all products with optional filters for pagination, name, and price range.
   * @param pageNumber - The page number for pagination.
   * @param pageSize - The number of products per page.
   * @param name - Optional filter for product name.
   * @param minPrice - Optional minimum price filter.
   * @param maxPrice - Optional maximum price filter.
   * @access public
   * @returns A list of products matching the criteria.
   */
  public getAllProducts(pageNumber: number, pageSize: number, name?: string, minPrice?: string, maxPrice?: string) {
    const filters = {
      ...(name ? { name: Like(`%${name ? name.trim().toLowerCase() : ''}%`) } : {}),
      ...(minPrice || maxPrice
        ? { price: Between(minPrice ? parseFloat(minPrice) : 0, maxPrice ? parseFloat(maxPrice) : Number.MAX_VALUE) }
        : {}),
    };
    return this.productRepository.find({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      where: filters,
    });
  }

  /**
   * Retrieves a single product by its ID.
   * @param id - The ID of the product to retrieve.
   * @access public
   * @returns The product with the specified ID.
   * @throws NotFoundException if the product is not found.
   */
  public async getSingleProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Creates a new product with the provided details.
   * @param body - The data transfer object containing product details.
   * @param userId - The ID of the user creating the product.
   * @access private
   * This method is typically used by admin users to create products.
   * @returns The created product.
   */
  public async createProduct(body: CreateProductDTO, userId: number) {
    const user = await this.usersService.getCurrentUser(userId);
    const newProduct = this.productRepository.create({
      ...body,
      name: body.name.trim().toLowerCase(),
      description: body.description.trim().toLowerCase(),
      user,
    });
    return this.productRepository.save(newProduct);
  }

  /**
   * Updates an existing product with the provided details.
   * @param id - The ID of the product to update.
   * @param body - The data transfer object containing updated product details.
   * @access private
   * This method is typically used by admin users to update products.
   * @returns The updated product.
   * @throws NotFoundException if the product is not found.
   */
  public async updateProduct(id: number, body: UpdateProductDTO) {
    const product = await this.getSingleProduct(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.name = body.name ?? product.name;
    product.description = body.description ?? product.description;
    product.price = body.price ?? product.price;

    return this.productRepository.save(product);
  }

  /**
   * Deletes a product by its ID.
   * @param id - The ID of the product to delete.
   * @access private
   * This method is typically used by admin users to delete products.
   * @returns A confirmation message upon successful deletion.
   * @throws NotFoundException if the product is not found.
   */
  public async deleteProduct(id: number) {
    const product = await this.getSingleProduct(id);
    await this.productRepository.remove(product);
    return {
      message: 'Product deleted successfully',
    };
  }
}
