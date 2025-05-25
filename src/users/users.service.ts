import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserType } from 'src/utils/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async register(registerDTO: RegisterDto): Promise<AccessTokenType> {
    const { email, password, username } = registerDTO;
    const checkUser = await this.userRepository.findOne({ where: { email } });
    if (checkUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    let newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
    });
    newUser = await this.userRepository.save(newUser);
    const accessToken = await this.generateToken({ id: newUser.id, userType: newUser.userType });
    return { accessToken };
  }

  public async login(loginDto: LoginDto): Promise<AccessTokenType> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }
    const accessToken = await this.generateToken({ id: user.id, userType: user.userType });
    return { accessToken };
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
      user.password = await this.hashPassword(password);
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

  private async generateToken(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
