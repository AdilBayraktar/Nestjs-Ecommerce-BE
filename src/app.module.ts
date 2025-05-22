import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ProductsModule,
    ReviewsModule,
    UsersModule,

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
        return {
          type: 'postgres',
          database: config.get<string>('DB_NAME'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          port: config.get<number>('DB_PORT'),
          host: config.get<string>('DB_HOST'),
          synchronize: process.env.NODE_ENV !== 'production', // for development only
          entities: [Product],
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [
        () => {
          console.log('🔧 ENV FILE LOADED:', process.env.NODE_ENV);
          return {};
        },
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
