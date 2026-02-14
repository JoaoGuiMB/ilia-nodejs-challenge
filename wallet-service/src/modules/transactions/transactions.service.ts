import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionResponse } from './interfaces/transaction-response.interface';
import {
  ITransactionsRepository,
  TRANSACTIONS_REPOSITORY,
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
  ): Promise<TransactionResponse[]> {
    let transactions: Transaction[];

    if (filter?.type) {
      transactions = await this.transactionsRepository.findByUserIdAndType(
        userId,
        filter.type,
      );
    } else {
      transactions = await this.transactionsRepository.findByUserId(userId);
    }

    return transactions.map((transaction) => this.toResponse(transaction));
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
