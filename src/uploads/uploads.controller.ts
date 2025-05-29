import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('/api/v1/uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
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
