import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { UpdateProductDTO } from './dtos/update-product.dto';
type ProductType = {
  id: number;
  name: string;
  price: number;
};

@Controller('api/v1/products')
export class ProductsController {
  private products: ProductType[] = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
    { id: 3, name: 'Product 3', price: 300 },
  ];
  @Get()
  public getAllProducts() {
    return this.products;
  }

  @Get(':id')
  public getSingleProduct(@Param('id') id: string) {
    const product = this.products.find((product) => product.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    console.log(id);
    return product;
  }

  @Post()
  public createProduct(@Body() body: CreateProductDTO) {
    const newProduct: ProductType = {
      id: this.products.length + 1,
      name: body.name,
      price: body.price,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  @Put(':id')
  public updateProduct(@Param('id') id: string, @Body() body: UpdateProductDTO) {
    const product = this.products.find((product) => product.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    console.log(body);
    return { message: 'Product updated successfully', product: { ...product, ...body } };
  }

  @Delete(':id')
  public deleteProduct(@Param('id') id: string) {
    const product = this.products.find((product) => product.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    console.log(id);
    return { message: 'Product deleted successfully', product };
  }
}
