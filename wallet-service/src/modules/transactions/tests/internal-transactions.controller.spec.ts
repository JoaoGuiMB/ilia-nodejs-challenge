import { Test, TestingModule } from '@nestjs/testing';
import { InternalTransactionsController } from '../internal-transactions.controller';
import { TransactionsService } from '../transactions.service';
import { TransactionType } from '../../../common/types';

describe('InternalTransactionsController', () => {
  let controller: InternalTransactionsController;
  let transactionsService: TransactionsService;

  const mockTransactionsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalTransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<InternalTransactionsController>(
      InternalTransactionsController,
    );
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockTransactionResponse = {
      id: '987fcdeb-51a2-3e4b-c5d6-789012345678',
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'CREDIT',
      amount: 100.5,
      created_at: '2026-02-14T10:00:00.000Z',
    };

    it('should create a CREDIT transaction via internal endpoint', async () => {
      const dto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: TransactionType.CREDIT,
        amount: 100.5,
      };

      mockTransactionsService.create.mockResolvedValue(mockTransactionResponse);

      const result = await controller.create(dto);

      expect(result).toEqual(mockTransactionResponse);
      expect(transactionsService.create).toHaveBeenCalledWith(dto.userId, {
        type: dto.type,
        amount: dto.amount,
      });
    });

    it('should create a DEBIT transaction via internal endpoint', async () => {
      const dto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: TransactionType.DEBIT,
        amount: 50.25,
      };

      const debitResponse = {
        ...mockTransactionResponse,
        type: 'DEBIT',
        amount: 50.25,
      };

      mockTransactionsService.create.mockResolvedValue(debitResponse);

      const result = await controller.create(dto);

      expect(result.type).toBe('DEBIT');
      expect(result.amount).toBe(50.25);
      expect(transactionsService.create).toHaveBeenCalledWith(dto.userId, {
        type: dto.type,
        amount: dto.amount,
      });
    });

    it('should pass userId from DTO to service', async () => {
      const dto = {
        userId: 'specific-user-id',
        type: TransactionType.CREDIT,
        amount: 200,
      };

      mockTransactionsService.create.mockResolvedValue({
        ...mockTransactionResponse,
        user_id: 'specific-user-id',
      });

      await controller.create(dto);

      expect(transactionsService.create).toHaveBeenCalledWith(
        'specific-user-id',
        expect.any(Object),
      );
    });

    it('should handle service errors', async () => {
      const dto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: TransactionType.CREDIT,
        amount: 100,
      };

      mockTransactionsService.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.create(dto)).rejects.toThrow('Database error');
    });
  });
});
