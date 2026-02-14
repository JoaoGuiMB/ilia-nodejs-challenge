import { Injectable, Inject } from '@nestjs/common';
import { IBalanceService } from './interfaces/balance-service.interface';
import { BalanceResponse } from './interfaces/balance-response.interface';
import {
  ITransactionsRepository,
  TRANSACTIONS_REPOSITORY,
} from '../transactions/interfaces/transactions-repository.interface';
import { TransactionType } from '../../common/types';

@Injectable()
export class BalanceService implements IBalanceService {
  constructor(
    @Inject(TRANSACTIONS_REPOSITORY)
    private readonly transactionsRepository: ITransactionsRepository,
  ) {}

  async getBalance(userId: string): Promise<BalanceResponse> {
    const aggregations =
      await this.transactionsRepository.calculateBalanceByUserId(userId);

    let credits = 0;
    let debits = 0;

    for (const aggregation of aggregations) {
      const total = parseFloat(aggregation.total) || 0;
      if (aggregation.type === TransactionType.CREDIT) {
        credits = total;
      } else if (aggregation.type === TransactionType.DEBIT) {
        debits = total;
      }
    }

    return {
      amount: credits - debits,
    };
  }
}
