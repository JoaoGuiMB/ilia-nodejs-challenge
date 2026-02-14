import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { TransactionsController } from '../transactions.controller';
import { TransactionsService } from '../transactions.service';
import { AuthModule } from '../../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionType } from '../../../common/types';
import { TransactionResponse } from '../interfaces/transaction-response.interface';

describe('TransactionsController (Integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let mockTransactionsService: Partial<TransactionsService>;
  let validToken: string;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

  const mockTransactionResponse: TransactionResponse = {
    id: '223e4567-e89b-12d3-a456-426614174001',
    user_id: mockUserId,
    type: 'CREDIT',
    amount: 100.5,
    created_at: '2024-01-01T00:00:00.000Z',
  };

  beforeAll(async () => {
    mockTransactionsService = {
      create: jest.fn().mockResolvedValue(mockTransactionResponse),
      findAllByUser: jest.fn().mockResolvedValue([mockTransactionResponse]),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'ILIACHALLENGE',
            }),
          ],
        }),
        AuthModule,
      ],
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = module.get<JwtService>(JwtService);
    validToken = jwtService.sign({
      sub: mockUserId,
      email: 'test@example.com',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /transactions', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ type: 'CREDIT', amount: 100 })
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .send({ type: 'CREDIT', amount: 100 })
        .expect(401);
    });

    it('should create a transaction with valid token', async () => {
      const createDto = { type: 'CREDIT', amount: 100.5 };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(createDto)
        .expect(201);

      expect(mockTransactionsService.create).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          type: TransactionType.CREDIT,
          amount: 100.5,
        }),
      );
      expect(response.body).toEqual(mockTransactionResponse);
    });

    it('should create a DEBIT transaction', async () => {
      const debitResponse: TransactionResponse = {
        ...mockTransactionResponse,
        type: 'DEBIT',
        amount: 50,
      };
      (mockTransactionsService.create as jest.Mock).mockResolvedValueOnce(
        debitResponse,
      );

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'DEBIT', amount: 50 })
        .expect(201);

      expect(response.body.type).toBe('DEBIT');
    });

    it('should reject invalid transaction type', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'INVALID', amount: 100 })
        .expect(400);
    });

    it('should reject missing amount', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'CREDIT' })
        .expect(400);
    });

    it('should reject negative amount via DTO validation', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'CREDIT', amount: -10 })
        .expect(400);
    });

    it('should reject zero amount via DTO validation', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'CREDIT', amount: 0 })
        .expect(400);
    });

    it('should reject non-numeric amount', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ type: 'CREDIT', amount: 'invalid' })
        .expect(400);
    });
  });

  describe('GET /transactions', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/transactions').expect(401);
    });

    it('should return user transactions with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(mockTransactionsService.findAllByUser).toHaveBeenCalledWith(
        mockUserId,
        expect.any(Object),
      );
      expect(response.body).toEqual([mockTransactionResponse]);
    });

    it('should filter by CREDIT type', async () => {
      await request(app.getHttpServer())
        .get('/transactions?type=CREDIT')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(mockTransactionsService.findAllByUser).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({ type: TransactionType.CREDIT }),
      );
    });

    it('should filter by DEBIT type', async () => {
      await request(app.getHttpServer())
        .get('/transactions?type=DEBIT')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(mockTransactionsService.findAllByUser).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({ type: TransactionType.DEBIT }),
      );
    });

    it('should ignore invalid type filter', async () => {
      await request(app.getHttpServer())
        .get('/transactions?type=INVALID')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);
    });

    it('should return empty array when no transactions', async () => {
      (mockTransactionsService.findAllByUser as jest.Mock).mockResolvedValueOnce(
        [],
      );

      const response = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});
