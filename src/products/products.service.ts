import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { UpdateProductDTO } from './dtos/update-product.dto';

type ProductType = {
  id: number;
  name: string;
  price: number;
};
@Injectable()
export class ProductsService {
  private products: ProductType[] = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
    { id: 3, name: 'Product 3', price: 300 },
  ];

  public getAllProducts() {
    return this.products;
  }

  public getSingleProduct(id: string) {
    const product = this.products.find((product) => product.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    console.log(id);
    return product;
  }

  public createProduct(body: CreateProductDTO) {
    const newProduct: ProductType = {
      id: this.products.length + 1,
      name: body.name,
      price: body.price,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  public updateProduct(id: string, body: UpdateProductDTO) {
    const product = this.products.find((product) => product.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    console.log(body);
    return { message: 'Product updated successfully', product: { ...product, ...body } };
  }

  public deleteProduct(id: string) {
    const product = this.products.find((product) => product.id === parseInt(id));
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    console.log(id);
    return { message: 'Product deleted successfully', product };
  }
}
