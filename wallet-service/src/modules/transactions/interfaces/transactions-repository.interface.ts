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

export interface ITransactionsRepository {
  create(data: CreateTransactionData): Promise<Transaction>;
  findByUserId(userId: string): Promise<Transaction[]>;
  findByUserIdAndType(
    userId: string,
    type: TransactionType,
  ): Promise<Transaction[]>;
  findOne(id: string): Promise<Transaction | null>;
  calculateBalanceByUserId(userId: string): Promise<BalanceAggregation[]>;
}

export const TRANSACTIONS_REPOSITORY = Symbol('TRANSACTIONS_REPOSITORY');
