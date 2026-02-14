import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsRepository } from './transactions.repository';
import { TRANSACTIONS_REPOSITORY } from './interfaces/transactions-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [
    TransactionsRepository,
    {
      provide: TRANSACTIONS_REPOSITORY,
      useExisting: TransactionsRepository,
    },
  ],
  exports: [TRANSACTIONS_REPOSITORY, TransactionsRepository],
})
export class TransactionsModule {}
