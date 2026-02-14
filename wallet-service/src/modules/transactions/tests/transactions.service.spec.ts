import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from '../transactions.service';
import {
  ITransactionsRepository,
  TRANSACTIONS_REPOSITORY,
} from '../interfaces/transactions-repository.interface';
import { TransactionType } from '../../../common/types';
import { Transaction } from '../entities/transaction.entity';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockRepository: jest.Mocked<ITransactionsRepository>;

  const mockTransaction: Transaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-123',
    type: TransactionType.CREDIT,
    amount: 100.5,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndType: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TRANSACTIONS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transaction with correct userId', async () => {
      const userId = 'user-123';
      const createDto = { type: TransactionType.CREDIT, amount: 100.5 };
      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await service.create(userId, createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        type: createDto.type,
        amount: createDto.amount,
      });
      expect(result).toEqual({
        id: mockTransaction.id,
        user_id: mockTransaction.userId,
        type: mockTransaction.type,
        amount: mockTransaction.amount,
        created_at: mockTransaction.createdAt.toISOString(),
      });
    });

    it('should create a DEBIT transaction', async () => {
      const userId = 'user-123';
      const createDto = { type: TransactionType.DEBIT, amount: 50 };
      const debitTransaction: Transaction = {
        ...mockTransaction,
        type: TransactionType.DEBIT,
        amount: 50,
      };
      mockRepository.create.mockResolvedValue(debitTransaction);

      const result = await service.create(userId, createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        type: TransactionType.DEBIT,
        amount: 50,
      });
      expect(result.type).toBe('DEBIT');
    });

    it('should reject negative amount', async () => {
      const userId = 'user-123';
      const createDto = { type: TransactionType.CREDIT, amount: -10 };

      await expect(service.create(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(userId, createDto)).rejects.toThrow(
        'Amount must be positive',
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should reject zero amount', async () => {
      const userId = 'user-123';
      const createDto = { type: TransactionType.CREDIT, amount: 0 };

      await expect(service.create(userId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    const transactions: Transaction[] = [
      mockTransaction,
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        userId: 'user-123',
        type: TransactionType.DEBIT,
        amount: 25.0,
        createdAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    ];

    it('should return all transactions for a user', async () => {
      const userId = 'user-123';
      mockRepository.findByUserId.mockResolvedValue(transactions);

      const result = await service.findAllByUser(userId);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBe(userId);
      expect(result[1].user_id).toBe(userId);
    });

    it('should return empty array when user has no transactions', async () => {
      const userId = 'user-456';
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await service.findAllByUser(userId);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });

    it('should filter transactions by CREDIT type', async () => {
      const userId = 'user-123';
      const creditTransactions = [mockTransaction];
      mockRepository.findByUserIdAndType.mockResolvedValue(creditTransactions);

      const result = await service.findAllByUser(userId, {
        type: TransactionType.CREDIT,
      });

      expect(mockRepository.findByUserIdAndType).toHaveBeenCalledWith(
        userId,
        TransactionType.CREDIT,
      );
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('CREDIT');
    });

    it('should filter transactions by DEBIT type', async () => {
      const userId = 'user-123';
      const debitTransactions = [transactions[1]];
      mockRepository.findByUserIdAndType.mockResolvedValue(debitTransactions);

      const result = await service.findAllByUser(userId, {
        type: TransactionType.DEBIT,
      });

      expect(mockRepository.findByUserIdAndType).toHaveBeenCalledWith(
        userId,
        TransactionType.DEBIT,
      );
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('DEBIT');
    });

    it('should not filter when type is not provided', async () => {
      const userId = 'user-123';
      mockRepository.findByUserId.mockResolvedValue(transactions);

      const result = await service.findAllByUser(userId, {});

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockRepository.findByUserIdAndType).not.toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should convert transaction entity to response format', async () => {
      const userId = 'user-123';
      mockRepository.findByUserId.mockResolvedValue([mockTransaction]);

      const result = await service.findAllByUser(userId);

      expect(result[0]).toEqual({
        id: mockTransaction.id,
        user_id: mockTransaction.userId,
        type: mockTransaction.type,
        amount: mockTransaction.amount,
        created_at: mockTransaction.createdAt.toISOString(),
      });
    });
  });
});
