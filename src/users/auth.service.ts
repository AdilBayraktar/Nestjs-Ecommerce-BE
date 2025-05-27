import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
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

  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async generateToken(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
