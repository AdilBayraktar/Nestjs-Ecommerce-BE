import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';

@Controller('/api/v1/uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
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
  )
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    console.log('File Uploaded');
    return { message: 'File uploaded successfully' };
  }

  @Get(':image')
  public showUploadedFile(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, {
      root: 'imgs',
    });
  }
}
