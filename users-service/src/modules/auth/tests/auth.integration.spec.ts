import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthModule } from '../auth.module';
import { UsersModule } from '../../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let jwtService: JwtService;

  const testUser = {
    first_name: 'Test',
    last_name: 'User',
    email: 'test.auth@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USER'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
            entities: [User],
            synchronize: true,
          }),
        }),
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth', () => {
    let createdUserId: string;

    beforeAll(async () => {
      const user = await usersService.create(testUser);
      createdUserId = user.id;
    });

    afterAll(async () => {
      if (createdUserId) {
        await usersService.remove(createdUserId);
      }
    });

    it('should return access_token for valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.first_name).toBe(testUser.first_name);
      expect(response.body.user.last_name).toBe(testUser.last_name);
      expect(response.body.user).not.toHaveProperty('password');

      const decodedToken = jwtService.decode(response.body.access_token);
      expect(decodedToken).toHaveProperty('sub');
      expect(decodedToken).toHaveProperty('email', testUser.email);
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          password: testUser.password,
        })
        .expect(400);

      const message = Array.isArray(response.body.message)
        ? response.body.message.join(' ')
        : response.body.message;
      expect(message.toLowerCase()).toContain('email');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: testUser.email,
        })
        .expect(400);

      const message = Array.isArray(response.body.message)
        ? response.body.message.join(' ')
        : response.body.message;
      expect(message.toLowerCase()).toContain('password');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: 'not-an-email',
          password: testUser.password,
        })
        .expect(400);

      const message = Array.isArray(response.body.message)
        ? response.body.message.join(' ')
        : response.body.message;
      expect(message.toLowerCase()).toContain('email');
    });
  });

  describe('Protected Routes', () => {
    let accessToken: string;
    let createdUserId: string;

    beforeAll(async () => {
      const user = await usersService.create({
        first_name: 'Protected',
        last_name: 'Test',
        email: 'protected.test@example.com',
        password: 'password123',
      });
      createdUserId = user.id;

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: 'protected.test@example.com',
          password: 'password123',
        });

      accessToken = response.body.access_token;
    });

    afterAll(async () => {
      if (createdUserId) {
        await usersService.remove(createdUserId);
      }
    });

    it('should return 401 for GET /users without token', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should return 401 for GET /users with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should return users for GET /users with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return user for GET /users/:id with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdUserId);
      expect(response.body.email).toBe('protected.test@example.com');
    });

    it('should return 401 for GET /users/:id without token', async () => {
      await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(401);
    });

    it('should allow POST /users without authentication (registration)', async () => {
      const newUser = {
        first_name: 'New',
        last_name: 'User',
        email: 'newuser.noauth@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(newUser)
        .expect(201);

      expect(response.body.email).toBe(newUser.email);

      await usersService.remove(response.body.id);
    });
  });

  describe('Token Expiration', () => {
    it('should return 401 for expired token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 'test-id', email: 'test@example.com' },
        { expiresIn: '-1s' },
      );

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
