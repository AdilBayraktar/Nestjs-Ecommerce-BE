import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserType } from 'src/utils/enums';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  public async register(registerDTO: RegisterDto): Promise<AccessTokenType> {
    return this.authService.register(registerDTO);
  }

  public async login(loginDto: LoginDto): Promise<AccessTokenType> {
    return this.authService.login(loginDto);
  }

  public async getCurrentUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({});
  }

  public async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { password, username } = updateUserDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.username = username ?? user.username;
    if (password) {
      user.password = await this.authService.hashPassword(password);
    }
    return this.userRepository.save(user);
  }

  public async deleteUser(userId: number, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.id === payload.id && payload.userType === UserType.ADMIN) {
      await this.userRepository.remove(user);
      return { message: 'User deleted successfully' };
    }
    throw new ForbiddenException('Access denied, You are not authorized to delete this user');
  }
}
