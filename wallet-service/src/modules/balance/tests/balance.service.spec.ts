import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from '../balance.service';
import {
  ITransactionsRepository,
  TRANSACTIONS_REPOSITORY,
  BalanceAggregation,
} from '../../transactions/interfaces/transactions-repository.interface';
import { TransactionType } from '../../../common/types';

describe('BalanceService', () => {
  let service: BalanceService;
  let mockRepository: jest.Mocked<ITransactionsRepository>;

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
        BalanceService,
        {
          provide: TRANSACTIONS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should calculate balance correctly with credits and debits', async () => {
      const userId = 'user-123';
      const aggregations: BalanceAggregation[] = [
        { type: TransactionType.CREDIT, total: '300.00' },
        { type: TransactionType.DEBIT, total: '100.00' },
      ];
      mockRepository.calculateBalanceByUserId.mockResolvedValue(aggregations);

      const result = await service.getBalance(userId);

      expect(mockRepository.calculateBalanceByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual({ amount: 200 });
    });

    it('should return 0 for users with no transactions', async () => {
      const userId = 'user-456';
      mockRepository.calculateBalanceByUserId.mockResolvedValue([]);

      const result = await service.getBalance(userId);

      expect(mockRepository.calculateBalanceByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual({ amount: 0 });
    });

    it('should handle only credits (positive balance)', async () => {
      const userId = 'user-123';
      const aggregations: BalanceAggregation[] = [
        { type: TransactionType.CREDIT, total: '500.50' },
      ];
      mockRepository.calculateBalanceByUserId.mockResolvedValue(aggregations);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 500.5 });
    });

    it('should handle only debits (negative balance)', async () => {
      const userId = 'user-123';
      const aggregations: BalanceAggregation[] = [
        { type: TransactionType.DEBIT, total: '250.75' },
      ];
      mockRepository.calculateBalanceByUserId.mockResolvedValue(aggregations);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: -250.75 });
    });

    it('should handle large amounts correctly', async () => {
      const userId = 'user-123';
      const aggregations: BalanceAggregation[] = [
        { type: TransactionType.CREDIT, total: '999999999999.99' },
        { type: TransactionType.DEBIT, total: '1.00' },
      ];
      mockRepository.calculateBalanceByUserId.mockResolvedValue(aggregations);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 999999999998.99 });
    });

    it('should handle decimal precision correctly', async () => {
      const userId = 'user-123';
      const aggregations: BalanceAggregation[] = [
        { type: TransactionType.CREDIT, total: '100.10' },
        { type: TransactionType.DEBIT, total: '50.05' },
      ];
      mockRepository.calculateBalanceByUserId.mockResolvedValue(aggregations);

      const result = await service.getBalance(userId);

      expect(result.amount).toBeCloseTo(50.05, 2);
    });

    it('should handle equal credits and debits (zero balance)', async () => {
      const userId = 'user-123';
      const aggregations: BalanceAggregation[] = [
        { type: TransactionType.CREDIT, total: '100.00' },
        { type: TransactionType.DEBIT, total: '100.00' },
      ];
      mockRepository.calculateBalanceByUserId.mockResolvedValue(aggregations);

      const result = await service.getBalance(userId);

      expect(result).toEqual({ amount: 0 });
    });
  });
});
