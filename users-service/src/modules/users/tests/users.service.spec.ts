import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from '../interfaces/users-repository.interface';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<IUsersRepository>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    it('should create a new user with hashed password', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        firstName: createUserDto.first_name,
        lastName: createUserDto.last_name,
        email: createUserDto.email,
        password: hashedPassword,
      });
      expect(result).toEqual({
        id: mockUser.id,
        first_name: mockUser.firstName,
        last_name: mockUser.lastName,
        email: mockUser.email,
        created_at: mockUser.createdAt,
        updated_at: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'another-id' }];
      mockRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      result.forEach((user) => {
        expect(user).not.toHaveProperty('password');
        expect(user).toHaveProperty('first_name');
        expect(user).toHaveProperty('last_name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('id');
      });
    });
  });

  describe('findOne', () => {
    it('should return user without password', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        first_name: mockUser.firstName,
        last_name: mockUser.lastName,
        email: mockUser.email,
        created_at: mockUser.createdAt,
        updated_at: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user with password for internal use', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(result?.password).toBe(mockUser.password);
    });

    it('should return null if user not found', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      first_name: 'Jane',
      last_name: 'Smith',
    };

    it('should update user and return without password', async () => {
      const updatedUser = {
        ...mockUser,
        firstName: 'Jane',
        lastName: 'Smith',
      };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(mockRepository.update).toHaveBeenCalledWith(mockUser.id, {
        firstName: updateUserDto.first_name,
        lastName: updateUserDto.last_name,
      });
      expect(result.first_name).toBe('Jane');
      expect(result.last_name).toBe('Smith');
      expect(result).not.toHaveProperty('password');
    });

    it('should only update provided fields', async () => {
      const partialUpdate: UpdateUserDto = { first_name: 'Jane' };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Jane',
      });

      await service.update(mockUser.id, partialUpdate);

      expect(mockRepository.update).toHaveBeenCalledWith(mockUser.id, {
        firstName: 'Jane',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new email already exists', async () => {
      const updateWithEmail: UpdateUserDto = { email: 'existing@example.com' };
      const existingUserWithEmail = {
        ...mockUser,
        id: 'different-id',
        email: 'existing@example.com',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.findByEmail.mockResolvedValue(existingUserWithEmail);

      await expect(
        service.update(mockUser.id, updateWithEmail),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating to same email', async () => {
      const updateWithSameEmail: UpdateUserDto = { email: mockUser.email };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.findByEmail.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue(mockUser);

      const result = await service.update(mockUser.id, updateWithSameEmail);

      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.delete.mockResolvedValue(true);

      await expect(service.remove(mockUser.id)).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
