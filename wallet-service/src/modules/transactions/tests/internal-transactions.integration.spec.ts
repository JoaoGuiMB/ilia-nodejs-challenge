import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { ConfigModule } from '@nestjs/config';
import { InternalTransactionsController } from '../internal-transactions.controller';
import { TransactionsService } from '../transactions.service';
import { TRANSACTIONS_REPOSITORY } from '../interfaces/transactions-repository.interface';
import { AuthModule } from '../../auth/auth.module';

describe('InternalTransactionsController (Integration)', () => {
  let app: INestApplication;
  const JWT_INTERNAL_SECRET = 'ILIACHALLENGE_INTERNAL';
  const JWT_EXTERNAL_SECRET = 'ILIACHALLENGE';

  const mockTransactionsRepository = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdAndType: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: JWT_EXTERNAL_SECRET,
              JWT_INTERNAL_SECRET: JWT_INTERNAL_SECRET,
            }),
          ],
        }),
        AuthModule,
      ],
      controllers: [InternalTransactionsController],
      providers: [
        TransactionsService,
        {
          provide: TRANSACTIONS_REPOSITORY,
          useValue: mockTransactionsRepository,
        },
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const generateInternalToken = (): string => {
    return jwt.sign(
      { sub: 'users-service', email: 'internal@service.local', type: 'internal' },
      JWT_INTERNAL_SECRET,
      { expiresIn: '5m' },
    );
  };

  const generateExternalToken = (): string => {
    return jwt.sign(
      { sub: 'user-123', email: 'user@example.com' },
      JWT_EXTERNAL_SECRET,
      { expiresIn: '24h' },
    );
  };

  describe('POST /internal/transactions', () => {
    it('should accept requests with valid internal JWT', async () => {
      const mockTransaction = {
        id: '987fcdeb-51a2-3e4b-c5d6-789012345678',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'CREDIT',
        amount: 100.5,
        createdAt: new Date('2026-02-14T10:00:00.000Z'),
      };

      mockTransactionsRepository.create.mockResolvedValue(mockTransaction);

      const internalToken = generateInternalToken();

      const response = await request(app.getHttpServer())
        .post('/internal/transactions')
        .set('Authorization', `Bearer ${internalToken}`)
        .send({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          type: 'CREDIT',
          amount: 100.5,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.user_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(response.body.type).toBe('CREDIT');
      expect(response.body.amount).toBe(100.5);
    });

    it('should reject requests with external JWT', async () => {
      const externalToken = generateExternalToken();

      const response = await request(app.getHttpServer())
        .post('/internal/transactions')
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          type: 'CREDIT',
          amount: 100.5,
        });

      expect(response.status).toBe(401);
    });

    it('should reject requests without JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/internal/transactions')
        .send({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          type: 'CREDIT',
          amount: 100.5,
        });

      expect(response.status).toBe(401);
    });

    it('should reject expired internal JWT', async () => {
      const expiredToken = jwt.sign(
        { sub: 'users-service', email: 'internal@service.local', type: 'internal' },
        JWT_INTERNAL_SECRET,
        { expiresIn: '-1s' },
      );

      const response = await request(app.getHttpServer())
        .post('/internal/transactions')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          type: 'CREDIT',
          amount: 100.5,
        });

      expect(response.status).toBe(401);
    });

    it('should validate request body', async () => {
      const internalToken = generateInternalToken();

      const response = await request(app.getHttpServer())
        .post('/internal/transactions')
        .set('Authorization', `Bearer ${internalToken}`)
        .send({
          userId: 'not-a-uuid',
          type: 'INVALID_TYPE',
          amount: -100,
        });

      expect(response.status).toBe(400);
    });

    it('should create DEBIT transactions', async () => {
      const mockTransaction = {
        id: '987fcdeb-51a2-3e4b-c5d6-789012345678',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'DEBIT',
        amount: 50.25,
        createdAt: new Date('2026-02-14T10:00:00.000Z'),
      };

      mockTransactionsRepository.create.mockResolvedValue(mockTransaction);

      const internalToken = generateInternalToken();

      const response = await request(app.getHttpServer())
        .post('/internal/transactions')
        .set('Authorization', `Bearer ${internalToken}`)
        .send({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          type: 'DEBIT',
          amount: 50.25,
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('DEBIT');
      expect(response.body.amount).toBe(50.25);
    });
  });
});
