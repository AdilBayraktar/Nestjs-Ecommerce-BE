import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessTokenType, JWTPayloadType } from 'src/utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserType } from 'src/utils/enums';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  /**
   * Registers a new user and returns an access token.
   * @param registerDTO - The registration data transfer object.
   * @description This method creates a new user in the database and generates an access token for them.
   * @returns An access token for the newly registered user.
   */
  public async register(registerDTO: RegisterDto): Promise<AccessTokenType> {
    return this.authService.register(registerDTO);
  }

  /**
   * Logs in a user and returns an access token.
   * @param loginDto - The login data transfer object containing email and password.
   * @description This method authenticates the user and generates an access token.
   * @returns An access token for the logged-in user.
   */
  public async login(loginDto: LoginDto): Promise<AccessTokenType> {
    return this.authService.login(loginDto);
  }

  /**
   * Retrieves the current user based on the provided ID.
   * @param id - The ID of the user to retrieve.
   * @access private
   * @description This method fetches the user from the database using the provided ID.
   * It is typically used to get the details of the user making the request.
   * @returns The user object if found.
   * @throws BadRequestException if the user is not found.
   */
  public async getCurrentUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
  /**
   * Retrieves all users with pagination.
   * @param pageNumber - The page number for pagination.
   * @param pageSize - The number of users per page.
   * @description This method fetches a list of users from the database, allowing for pagination.
   * @returns A list of users for the specified page.
   */
  public async getAllUsers(pageNumber: number, pageSize: number): Promise<User[]> {
    return this.userRepository.find({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Updates a user's details.
   * @param id - The ID of the user to update.
   * @param updateUserDto - The data transfer object containing updated user details.
   * @description This method allows an admin or the user themselves to update their username and password.
   * @returns The updated user object.
   * @throws BadRequestException if the user is not found.
   */

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

  /**
   * Deletes a user based on their ID.
   * @param userId - The ID of the user to delete.
   * @param payload - The JWT payload containing the user's ID and type.
   * @description This method allows an admin to delete a user or a user to delete themselves.
   * @returns A success message if the user is deleted.
   * @throws BadRequestException if the user is not found.
   * @throws ForbiddenException if the user is not authorized to delete the specified user.
   */
  public async deleteUser(userId: number, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.id === payload.id || payload.userType === UserType.ADMIN) {
      await this.userRepository.remove(user);
      return { message: 'User deleted successfully' };
    }
    throw new ForbiddenException('Access denied, You are not authorized to delete this user');
  }
}
