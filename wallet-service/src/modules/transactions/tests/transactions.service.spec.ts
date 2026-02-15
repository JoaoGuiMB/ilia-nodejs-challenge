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

  const defaultPagination = { page: 1, limit: 8 };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdAndType: jest.fn(),
      findOne: jest.fn(),
      calculateBalanceByUserId: jest.fn(),
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

    it('should return paginated transactions for a user', async () => {
      const userId = 'user-123';
      mockRepository.findByUserId.mockResolvedValue({
        data: transactions,
        total: 2,
      });

      const result = await service.findAllByUser(userId);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        defaultPagination,
      );
      expect(result.data).toHaveLength(2);
      expect(result.data[0].user_id).toBe(userId);
      expect(result.data[1].user_id).toBe(userId);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(8);
    });

    it('should return correct pagination metadata', async () => {
      const userId = 'user-123';
      mockRepository.findByUserId.mockResolvedValue({
        data: transactions,
        total: 20,
      });

      const result = await service.findAllByUser(userId, {
        page: 2,
        limit: 8,
      });

      expect(result.meta).toEqual({
        page: 2,
        limit: 8,
        total: 20,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should return hasNextPage false on last page', async () => {
      const userId = 'user-123';
      mockRepository.findByUserId.mockResolvedValue({
        data: transactions,
        total: 10,
      });

      const result = await service.findAllByUser(userId, {
        page: 2,
        limit: 8,
      });

      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should return empty array when user has no transactions', async () => {
      const userId = 'user-456';
      mockRepository.findByUserId.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await service.findAllByUser(userId);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        defaultPagination,
      );
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should filter transactions by CREDIT type', async () => {
      const userId = 'user-123';
      const creditTransactions = [mockTransaction];
      mockRepository.findByUserIdAndType.mockResolvedValue({
        data: creditTransactions,
        total: 1,
      });

      const result = await service.findAllByUser(userId, {
        type: TransactionType.CREDIT,
      });

      expect(mockRepository.findByUserIdAndType).toHaveBeenCalledWith(
        userId,
        TransactionType.CREDIT,
        defaultPagination,
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('CREDIT');
    });

    it('should filter transactions by DEBIT type', async () => {
      const userId = 'user-123';
      const debitTransactions = [transactions[1]];
      mockRepository.findByUserIdAndType.mockResolvedValue({
        data: debitTransactions,
        total: 1,
      });

      const result = await service.findAllByUser(userId, {
        type: TransactionType.DEBIT,
      });

      expect(mockRepository.findByUserIdAndType).toHaveBeenCalledWith(
        userId,
        TransactionType.DEBIT,
        defaultPagination,
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('DEBIT');
    });

    it('should not filter when type is not provided', async () => {
      const userId = 'user-123';
      mockRepository.findByUserId.mockResolvedValue({
        data: transactions,
        total: 2,
      });

      const result = await service.findAllByUser(userId, {});

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        defaultPagination,
      );
      expect(mockRepository.findByUserIdAndType).not.toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
    });

    it('should convert transaction entity to response format', async () => {
      const userId = 'user-123';
      mockRepository.findByUserId.mockResolvedValue({
        data: [mockTransaction],
        total: 1,
      });

      const result = await service.findAllByUser(userId);

      expect(result.data[0]).toEqual({
        id: mockTransaction.id,
        user_id: mockTransaction.userId,
        type: mockTransaction.type,
        amount: mockTransaction.amount,
        created_at: mockTransaction.createdAt.toISOString(),
      });
    });
  });
});
