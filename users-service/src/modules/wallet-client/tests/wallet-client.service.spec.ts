import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { WalletClientService } from '../wallet-client.service';

describe('WalletClientService', () => {
  let service: WalletClientService;
  let mockFetch: jest.Mock;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        WALLET_SERVICE_URL: 'http://localhost:3001',
        JWT_INTERNAL_SECRET: 'ILIACHALLENGE_INTERNAL',
      };
      return config[key];
    }),
  };

  beforeAll(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  beforeEach(async () => {
    mockFetch.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletClientService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<WalletClientService>(WalletClientService);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('generateInternalToken', () => {
    it('should generate a valid JWT token', () => {
      const token = service.generateInternalToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should generate a token with correct payload', () => {
      const token = service.generateInternalToken();
      const decoded = jwt.verify(token, 'ILIACHALLENGE_INTERNAL') as jwt.JwtPayload;

      expect(decoded.sub).toBe('users-service');
      expect(decoded.email).toBe('internal@service.local');
      expect(decoded.type).toBe('internal');
    });

    it('should generate a token that expires in 5 minutes', () => {
      const token = service.generateInternalToken();
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      const iat = decoded.iat as number;
      const exp = decoded.exp as number;
      const expiresInSeconds = exp - iat;

      expect(expiresInSeconds).toBe(300); // 5 minutes = 300 seconds
    });

    it('should not be verifiable with external JWT secret', () => {
      const token = service.generateInternalToken();

      expect(() => {
        jwt.verify(token, 'ILIACHALLENGE');
      }).toThrow();
    });
  });

  describe('createTransaction', () => {
    const createTransactionRequest = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      type: 'CREDIT' as const,
      amount: 100.5,
    };

    const mockTransactionResponse = {
      id: '987fcdeb-51a2-3e4b-c5d6-789012345678',
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'CREDIT',
      amount: 100.5,
      created_at: '2026-02-14T10:00:00.000Z',
    };

    it('should create a transaction successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactionResponse),
      });

      const result = await service.createTransaction(createTransactionRequest);

      expect(result).toEqual(mockTransactionResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/internal/transactions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringMatching(/^Bearer /),
          }),
          body: JSON.stringify({
            userId: createTransactionRequest.userId,
            type: createTransactionRequest.type,
            amount: createTransactionRequest.amount,
          }),
        }),
      );
    });

    it('should include a valid internal JWT in the request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactionResponse),
      });

      await service.createTransaction(createTransactionRequest);

      const fetchCall = mockFetch.mock.calls[0];
      const authHeader = fetchCall[1].headers.Authorization;
      const token = authHeader.replace('Bearer ', '');

      const decoded = jwt.verify(token, 'ILIACHALLENGE_INTERNAL') as jwt.JwtPayload;
      expect(decoded.sub).toBe('users-service');
      expect(decoded.type).toBe('internal');
    });

    it('should throw InternalServerErrorException when wallet service returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(
        service.createTransaction(createTransactionRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when wallet service returns 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(
        service.createTransaction(createTransactionRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle DEBIT transactions', async () => {
      const debitRequest = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'DEBIT' as const,
        amount: 50.25,
      };

      const mockDebitResponse = {
        ...mockTransactionResponse,
        type: 'DEBIT',
        amount: 50.25,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDebitResponse),
      });

      const result = await service.createTransaction(debitRequest);

      expect(result.type).toBe('DEBIT');
      expect(result.amount).toBe(50.25);
    });
  });

  describe('constructor', () => {
    it('should throw error when WALLET_SERVICE_URL is not defined', async () => {
      const invalidConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'WALLET_SERVICE_URL') return undefined;
          return 'ILIACHALLENGE_INTERNAL';
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            WalletClientService,
            { provide: ConfigService, useValue: invalidConfigService },
          ],
        }).compile(),
      ).rejects.toThrow('WALLET_SERVICE_URL is not defined');
    });

    it('should throw error when JWT_INTERNAL_SECRET is not defined', async () => {
      const invalidConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'JWT_INTERNAL_SECRET') return undefined;
          return 'http://localhost:3001';
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            WalletClientService,
            { provide: ConfigService, useValue: invalidConfigService },
          ],
        }).compile(),
      ).rejects.toThrow('JWT_INTERNAL_SECRET is not defined');
    });
  });
});
