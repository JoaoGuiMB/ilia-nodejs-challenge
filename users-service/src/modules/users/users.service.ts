import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './interfaces/user-response.interface';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from './interfaces/users-repository.interface';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.SALT_ROUNDS,
    );

    const user = await this.usersRepository.create({
      firstName: createUserDto.first_name,
      lastName: createUserDto.last_name,
      email: createUserDto.email,
      password: hashedPassword,
    });

    return this.toUserResponse(user);
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => this.toUserResponse(user));
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserResponse(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findOne(id);

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );
      if (userWithEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } = {};

    if (updateUserDto.first_name !== undefined) {
      updateData.firstName = updateUserDto.first_name;
    }

    if (updateUserDto.last_name !== undefined) {
      updateData.lastName = updateUserDto.last_name;
    }

    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }

    const updatedUser = await this.usersRepository.update(id, updateData);

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserResponse(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne(id);

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.delete(id);
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
