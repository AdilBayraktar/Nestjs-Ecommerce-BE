import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { UpdateProductDTO } from './dtos/update-product.dto';
import { Repository } from 'typeorm';
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

  public getAllProducts() {
    return this.productRepository.find({
      relations: ['user', 'reviews'],
    });
  }

  public async getSingleProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

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

  public async deleteProduct(id: number) {
    const product = await this.getSingleProduct(id);
    await this.productRepository.remove(product);
    return {
      message: 'Product deleted successfully',
    };
  }
}
