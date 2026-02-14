import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { BalanceController } from '../balance.controller';
import { BalanceService } from '../balance.service';
import { AuthModule } from '../../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { BalanceResponse } from '../interfaces/balance-response.interface';

describe('BalanceController (Integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let mockBalanceService: Partial<BalanceService>;
  let validToken: string;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

  const mockBalanceResponse: BalanceResponse = {
    amount: 250.5,
  };

  beforeAll(async () => {
    mockBalanceService = {
      getBalance: jest.fn().mockResolvedValue(mockBalanceResponse),
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
      controllers: [BalanceController],
      providers: [
        {
          provide: BalanceService,
          useValue: mockBalanceService,
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

  describe('GET /balance', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/balance').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/balance')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwtService.sign(
        { sub: mockUserId, email: 'test@example.com' },
        { expiresIn: '-1h' },
      );

      await request(app.getHttpServer())
        .get('/balance')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should return balance for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/balance')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(mockBalanceService.getBalance).toHaveBeenCalledWith(mockUserId);
      expect(response.body).toEqual(mockBalanceResponse);
    });

    it('should return 0 balance for new user', async () => {
      const zeroBalanceResponse: BalanceResponse = { amount: 0 };
      (mockBalanceService.getBalance as jest.Mock).mockResolvedValueOnce(
        zeroBalanceResponse,
      );

      const response = await request(app.getHttpServer())
        .get('/balance')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual({ amount: 0 });
    });

    it('should return negative balance when debits exceed credits', async () => {
      const negativeBalanceResponse: BalanceResponse = { amount: -150.25 };
      (mockBalanceService.getBalance as jest.Mock).mockResolvedValueOnce(
        negativeBalanceResponse,
      );

      const response = await request(app.getHttpServer())
        .get('/balance')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toEqual({ amount: -150.25 });
    });

    it('should return balance with decimal precision', async () => {
      const decimalBalanceResponse: BalanceResponse = { amount: 1234.56 };
      (mockBalanceService.getBalance as jest.Mock).mockResolvedValueOnce(
        decimalBalanceResponse,
      );

      const response = await request(app.getHttpServer())
        .get('/balance')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.amount).toBe(1234.56);
    });

    it('should call service with correct userId from token', async () => {
      const anotherUserId = '999e4567-e89b-12d3-a456-426614174999';
      const anotherToken = jwtService.sign({
        sub: anotherUserId,
        email: 'another@example.com',
      });

      await request(app.getHttpServer())
        .get('/balance')
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(200);

      expect(mockBalanceService.getBalance).toHaveBeenCalledWith(anotherUserId);
    });
  });
});
