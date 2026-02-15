import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionResponse } from './interfaces/transaction-response.interface';
import { PaginatedResponse } from './interfaces/paginated-response.interface';
import {
  ITransactionsRepository,
  TRANSACTIONS_REPOSITORY,
  PaginatedResult,
} from './interfaces/transactions-repository.interface';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: ITransactionsRepository,
  ) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    if (createTransactionDto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const transaction = await this.transactionsRepository.create({
      userId,
      type: createTransactionDto.type,
      amount: createTransactionDto.amount,
    });

    return this.toResponse(transaction);
  }

  async findAllByUser(
    userId: string,
    filter?: TransactionFilterDto,
  ): Promise<PaginatedResponse<TransactionResponse>> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 8;
    const pagination = { page, limit };

    let result: PaginatedResult<Transaction>;

    if (filter?.type) {
      result = await this.transactionsRepository.findByUserIdAndType(
        userId,
        filter.type,
        pagination,
      );
    } else {
      result = await this.transactionsRepository.findByUserId(userId, pagination);
    }

    const totalPages = Math.ceil(result.total / limit);

    return {
      data: result.data.map((transaction) => this.toResponse(transaction)),
      meta: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  private toResponse(transaction: Transaction): TransactionResponse {
    return {
      id: transaction.id,
      user_id: transaction.userId,
      type: transaction.type,
      amount: Number(transaction.amount),
      created_at: transaction.createdAt.toISOString(),
    };
  }
}
