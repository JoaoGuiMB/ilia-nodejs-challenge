import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../../../common/types';

export interface CreateTransactionData {
  userId: string;
  type: TransactionType;
  amount: number;
}

export interface BalanceAggregation {
  type: TransactionType;
  total: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ITransactionsRepository {
  create(data: CreateTransactionData): Promise<Transaction>;
  findByUserId(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Transaction>>;
  findByUserIdAndType(
    userId: string,
    type: TransactionType,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Transaction>>;
  findOne(id: string): Promise<Transaction | null>;
  calculateBalanceByUserId(userId: string): Promise<BalanceAggregation[]>;
}

export const TRANSACTIONS_REPOSITORY = Symbol('TRANSACTIONS_REPOSITORY');
