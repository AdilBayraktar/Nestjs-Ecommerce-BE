import { BadRequestException, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  controllers: [UploadsController],
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './imgs',
        filename: (req, file, cb) => {
          const prefex = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
          const fileName = `${prefex}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file format'), false);
        }
      },
      limits: {
        fieldSize: 1024 * 1024 * 2, // 2 megabytes
      },
    }),
  ],
})
export class UploadsModule {}
