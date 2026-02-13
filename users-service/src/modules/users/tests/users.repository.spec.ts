import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from '../users.repository';
import { User } from '../entities/user.entity';
import { CreateUserData, UpdateUserData } from '../interfaces/users-repository.interface';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserData: CreateUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword123',
      };

      mockTypeOrmRepository.create.mockReturnValue(mockUser);
      mockTypeOrmRepository.save.mockResolvedValue(mockUser);

      const result = await usersRepository.create(createUserData);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(createUserData);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors when save fails', async () => {
      const createUserData: CreateUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword123',
      };

      const error = new Error('Database error');
      mockTypeOrmRepository.create.mockReturnValue(mockUser);
      mockTypeOrmRepository.save.mockRejectedValue(error);

      await expect(usersRepository.create(createUserData)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersRepository.findOne(mockUser.id);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await usersRepository.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersRepository.findByEmail(mockUser.email);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found by email', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await usersRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'another-id', email: 'another@example.com' }];
      mockTypeOrmRepository.find.mockResolvedValue(mockUsers);

      const result = await usersRepository.findAll();

      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no users exist', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await usersRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update and return the user when found', async () => {
      const updateData: UpdateUserData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const updatedUser = { ...mockUser, ...updateData };

      mockTypeOrmRepository.findOne.mockResolvedValueOnce(mockUser);
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(updatedUser);

      const result = await usersRepository.update(mockUser.id, updateData);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user to update is not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await usersRepository.update('non-existent-id', { firstName: 'Jane' });

      expect(result).toBeNull();
      expect(mockTypeOrmRepository.update).not.toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const updateData: UpdateUserData = { email: 'new.email@example.com' };
      const updatedUser = { ...mockUser, ...updateData };

      mockTypeOrmRepository.findOne.mockResolvedValueOnce(mockUser);
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      mockTypeOrmRepository.findOne.mockResolvedValueOnce(updatedUser);

      const result = await usersRepository.update(mockUser.id, updateData);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(result?.email).toBe('new.email@example.com');
    });
  });

  describe('delete', () => {
    it('should return true when user is deleted successfully', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await usersRepository.delete(mockUser.id);

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(true);
    });

    it('should return false when user to delete is not found', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result = await usersRepository.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: undefined, raw: [] });

      const result = await usersRepository.delete(mockUser.id);

      expect(result).toBe(false);
    });
  });
});
