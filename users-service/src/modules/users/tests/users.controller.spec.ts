import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { HttpExceptionFilter } from '../../../common/filters/http-exception.filter';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponse } from '../interfaces/user-response.interface';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let usersService: jest.Mocked<UsersService>;

  const mockUserResponse: UserResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { sub: mockUserResponse.id, email: mockUserResponse.email };
      return true;
    },
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    const createUserDto: CreateUserDto = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    it('should create a new user', async () => {
      usersService.create.mockResolvedValue(mockUserResponse);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('first_name', 'John');
      expect(response.body).toHaveProperty('last_name', 'Doe');
      expect(response.body).toHaveProperty('email', 'john.doe@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 409 Conflict for duplicate email', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toBe('Email already exists');
    });

    it('should return 400 Bad Request for invalid email', async () => {
      const invalidDto = { ...createUserDto, email: 'invalid-email' };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 Bad Request for short password', async () => {
      const invalidDto = { ...createUserDto, password: 'short' };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 Bad Request for missing first_name', async () => {
      const invalidDto = {
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        mockUserResponse,
        { ...mockUserResponse, id: 'another-id', email: 'jane@example.com' },
      ];
      usersService.findAll.mockResolvedValue(mockUsers);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach((user: UserResponse) => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a single user', async () => {
      usersService.findOne.mockResolvedValue(mockUserResponse);

      const response = await request(app.getHttpServer())
        .get(`/users/${mockUserResponse.id}`)
        .expect(200);

      expect(response.body.id).toBe(mockUserResponse.id);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      usersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      const response = await request(app.getHttpServer())
        .get('/users/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('PATCH /users/:id', () => {
    const updateUserDto: UpdateUserDto = {
      first_name: 'Jane',
      last_name: 'Smith',
    };

    it('should update user', async () => {
      const updatedUser = {
        ...mockUserResponse,
        first_name: 'Jane',
        last_name: 'Smith',
      };
      usersService.update.mockResolvedValue(updatedUser);

      const response = await request(app.getHttpServer())
        .patch(`/users/${mockUserResponse.id}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body.first_name).toBe('Jane');
      expect(response.body.last_name).toBe('Smith');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      usersService.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      const response = await request(app.getHttpServer())
        .patch('/users/123e4567-e89b-12d3-a456-426614174999')
        .send(updateUserDto)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });

    it('should return 409 Conflict for duplicate email', async () => {
      usersService.update.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      const response = await request(app.getHttpServer())
        .patch(`/users/${mockUserResponse.id}`)
        .send({ email: 'existing@example.com' })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user and return 204', async () => {
      usersService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/users/${mockUserResponse.id}`)
        .expect(204);

      expect(usersService.remove).toHaveBeenCalledWith(mockUserResponse.id);
    });

    it('should return 404 for non-existent user', async () => {
      usersService.remove.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      const response = await request(app.getHttpServer())
        .delete('/users/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});
