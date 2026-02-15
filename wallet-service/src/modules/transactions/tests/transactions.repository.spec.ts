import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionsRepository } from '../transactions.repository';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../../../common/types';

describe('TransactionsRepository', () => {
  let transactionsRepository: TransactionsRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<Transaction>>;

  const mockTransaction: Transaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-123',
    type: TransactionType.CREDIT,
    amount: 100.5,
    createdAt: new Date('2026-01-01'),
  };

  const mockTransactionDebit: Transaction = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    userId: 'user-123',
    type: TransactionType.DEBIT,
    amount: 50.25,
    createdAt: new Date('2026-01-02'),
  };

  const defaultPagination = { page: 1, limit: 8 };

  beforeEach(async () => {
    mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Transaction>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsRepository,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    transactionsRepository = module.get<TransactionsRepository>(
      TransactionsRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a transaction', async () => {
      const createData = {
        userId: 'user-123',
        type: TransactionType.CREDIT,
        amount: 100.5,
      };

      mockTypeOrmRepository.create.mockReturnValue(mockTransaction);
      mockTypeOrmRepository.save.mockResolvedValue(mockTransaction);

      const result = await transactionsRepository.create(createData);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(createData);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual(mockTransaction);
    });

    it('should save transaction with decimal amount', async () => {
      const createData = {
        userId: 'user-123',
        type: TransactionType.CREDIT,
        amount: 100.99,
      };

      const transactionWithDecimal = { ...mockTransaction, amount: 100.99 };
      mockTypeOrmRepository.create.mockReturnValue(transactionWithDecimal);
      mockTypeOrmRepository.save.mockResolvedValue(transactionWithDecimal);

      const result = await transactionsRepository.create(createData);

      expect(result.amount).toBe(100.99);
    });

    it('should save DEBIT transaction', async () => {
      const createData = {
        userId: 'user-123',
        type: TransactionType.DEBIT,
        amount: 50.25,
      };

      mockTypeOrmRepository.create.mockReturnValue(mockTransactionDebit);
      mockTypeOrmRepository.save.mockResolvedValue(mockTransactionDebit);

      const result = await transactionsRepository.create(createData);

      expect(result.type).toBe(TransactionType.DEBIT);
    });
  });

  describe('findByUserId', () => {
    it('should return paginated transactions for a user ordered by createdAt DESC', async () => {
      const transactions = [mockTransactionDebit, mockTransaction];
      mockTypeOrmRepository.findAndCount.mockResolvedValue([transactions, 2]);

      const result = await transactionsRepository.findByUserId(
        'user-123',
        defaultPagination,
      );

      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 8,
      });
      expect(result.data).toEqual(transactions);
      expect(result.total).toBe(2);
    });

    it('should return correct offset for page 2', async () => {
      const transactions = [mockTransaction];
      mockTypeOrmRepository.findAndCount.mockResolvedValue([transactions, 10]);

      const result = await transactionsRepository.findByUserId('user-123', {
        page: 2,
        limit: 8,
      });

      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        skip: 8,
        take: 8,
      });
      expect(result.data).toEqual(transactions);
      expect(result.total).toBe(10);
    });

    it('should return empty array when user has no transactions', async () => {
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await transactionsRepository.findByUserId(
        'nonexistent-user',
        defaultPagination,
      );

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findByUserIdAndType', () => {
    it('should return only CREDIT transactions for a user with pagination', async () => {
      const creditTransactions = [mockTransaction];
      mockTypeOrmRepository.findAndCount.mockResolvedValue([
        creditTransactions,
        1,
      ]);

      const result = await transactionsRepository.findByUserIdAndType(
        'user-123',
        TransactionType.CREDIT,
        defaultPagination,
      );

      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-123', type: TransactionType.CREDIT },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 8,
      });
      expect(result.data).toEqual(creditTransactions);
      expect(result.total).toBe(1);
      expect(result.data.every((t) => t.type === TransactionType.CREDIT)).toBe(
        true,
      );
    });

    it('should return only DEBIT transactions for a user with pagination', async () => {
      const debitTransactions = [mockTransactionDebit];
      mockTypeOrmRepository.findAndCount.mockResolvedValue([
        debitTransactions,
        1,
      ]);

      const result = await transactionsRepository.findByUserIdAndType(
        'user-123',
        TransactionType.DEBIT,
        defaultPagination,
      );

      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-123', type: TransactionType.DEBIT },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 8,
      });
      expect(result.data).toEqual(debitTransactions);
      expect(result.total).toBe(1);
      expect(result.data.every((t) => t.type === TransactionType.DEBIT)).toBe(
        true,
      );
    });

    it('should return empty array when user has no transactions of that type', async () => {
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await transactionsRepository.findByUserIdAndType(
        'user-123',
        TransactionType.CREDIT,
        defaultPagination,
      );

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await transactionsRepository.findOne(mockTransaction.id);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should return null when transaction is not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result =
        await transactionsRepository.findOne('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
