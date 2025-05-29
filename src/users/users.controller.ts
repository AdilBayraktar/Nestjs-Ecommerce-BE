import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from './users.service';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { JWTPayloadType } from 'src/utils/types';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from 'src/utils/enums';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('/api/v1/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  public async register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @Get('/current-user')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    console.log('Get Current User Route Called');
    return this.usersService.getCurrentUser(payload.id);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @HttpCode(HttpStatus.OK)
  public async getAllUsers(
    @Query('pageNumber', ParseIntPipe) pageNumber: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 100,
  ) {
    return this.usersService.getAllUsers(pageNumber, pageSize);
  }

  @Put()
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public async updateUser(@CurrentUser() payload: JWTPayloadType, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(payload.id, body);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  public async deleteUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayloadType) {
    return this.usersService.deleteUser(id, payload);
  }

  @Post('upload-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  public oploadProfileImage(@CurrentUser() payload: JWTPayloadType, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image provided');
    return this.usersService.setProfileImage(payload.id, file.filename);
  }

  @Get('images/:image')
  @UseGuards(AuthGuard)
  public getProfileImage(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: 'imgs/users' });
  }

  @Get('verify-email/:id/:verificationToken')
  public verifyEmail(@Param('id', ParseIntPipe) id: number, @Param('verificationToken') verificationToken: string) {
    return this.usersService.verifyEmail(id, verificationToken);
  }
}
