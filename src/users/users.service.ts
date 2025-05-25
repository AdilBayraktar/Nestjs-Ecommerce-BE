import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { ConfigService } from '@nestjs/config';

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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
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

  private async generateToken(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
