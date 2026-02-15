import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import {
  ITransactionsRepository,
  CreateTransactionData,
  BalanceAggregation,
  PaginationParams,
  PaginatedResult,
} from './interfaces/transactions-repository.interface';
import { TransactionType } from '../../common/types';

@Injectable()
export class TransactionsRepository implements ITransactionsRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async create(data: CreateTransactionData): Promise<Transaction> {
    const transaction = this.repository.create(data);
    return this.repository.save(transaction);
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Transaction>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async findByUserIdAndType(
    userId: string,
    type: TransactionType,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Transaction>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { userId, type },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Transaction | null> {
    return this.repository.findOne({ where: { id } });
  }

  async calculateBalanceByUserId(userId: string): Promise<BalanceAggregation[]> {
    return this.repository
      .createQueryBuilder('transaction')
      .select('transaction.type', 'type')
      .addSelect('SUM(transaction.amount)', 'total')
      .where('transaction.userId = :userId', { userId })
      .groupBy('transaction.type')
      .getRawMany();
  }
}
