import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateProductDTO } from './dtos/create-product.dto';
import { UpdateProductDTO } from './dtos/update-product.dto';
import { ProductsService } from './products.service';
import { AuthRolesGuard } from 'src/users/guards/auth-roles.guard';
import { UserType } from 'src/utils/enums';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { Roles } from 'src/users/decorators/user-role.decorator';
import { JWTPayloadType } from 'src/utils/types';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  public getAllProducts(
    @Query('name') name: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    console.log(name);
    return this.productsService.getAllProducts(name, minPrice, maxPrice);
  }

  @Get(':id')
  public getSingleProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getSingleProduct(id);
  }

  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  public async createProduct(@Body() body: CreateProductDTO, @CurrentUser() payload: JWTPayloadType) {
    return this.productsService.createProduct(body, payload.id);
  }

  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  public updateProduct(@Param('id') id: number, @Body() body: UpdateProductDTO) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  public async deleteProduct(@Param('id') id: number) {
    return await this.productsService.deleteProduct(id);
  }
}
