import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { UpdateProductDTO } from './dtos/update-product.dto';
import { ProductsService } from './products.service';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  public getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get(':id')
  public getSingleProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getSingleProduct(id);
  }

  @Post()
  public createProduct(@Body() body: CreateProductDTO) {
    return this.productsService.createProduct(body);
  }

  @Put(':id')
  public updateProduct(@Param('id') id: number, @Body() body: UpdateProductDTO) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  public async deleteProduct(@Param('id') id: number) {
    return await this.productsService.deleteProduct(id);
  }
}
