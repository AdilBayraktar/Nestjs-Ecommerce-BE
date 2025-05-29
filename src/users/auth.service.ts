import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { JWTPayloadType } from 'src/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: MailService,
  ) {}

  /**
   * Registers a new user and returns an access token.
   * @param registerDTO - The registration data transfer object.
   * @returns An access token for the newly registered user.
   * @throws BadRequestException if the user already exists.
   */
  public async register(registerDTO: RegisterDto) {
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
      verificationToken: randomBytes(32).toString('hex'),
    });
    newUser = await this.userRepository.save(newUser);
    const link = this.generateLink(newUser.id, newUser.verificationToken);
    await this.emailService.sendVerificationEmailTemplate(email, link);
    return { message: 'Verification token has been sent to your email, please verify your email address' };
  }

  /**
   * Logs in a user and returns an access token.
   * @param loginDto - The login data transfer object containing email and password.
   * @returns An access token for the logged-in user.
   * @throws BadRequestException if the credentials are invalid.
   */
  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }
    if (!user.isAccountVerified) {
      let verificationToken = user.verificationToken;
      if (!verificationToken) {
        user.verificationToken = randomBytes(32).toString('hex');
        const result = await this.userRepository.save(user);
        verificationToken = result.verificationToken;
      }
      const link = this.generateLink(user.id, verificationToken);
      await this.emailService.sendVerificationEmailTemplate(email, link);
      return { message: 'Verification token has been sent to your email, please verify your email address' };
    }
    const accessToken = await this.generateToken({ id: user.id, userType: user.userType });
    // await this.emailService.sendLoginEmail(user.email);
    return { accessToken };
  }

  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async generateToken(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private generateLink(userId: number, verificationToken: string) {
    return `${this.config.get<string>('DOMAIN')}/api/v1/users/verify-email/${userId}/${verificationToken}`;
  }
}
