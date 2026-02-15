import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsRepository } from './transactions.repository';
import { TRANSACTIONS_REPOSITORY } from './interfaces/transactions-repository.interface';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { InternalTransactionsController } from './internal-transactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController, InternalTransactionsController],
  providers: [
    TransactionsRepository,
    {
      provide: TRANSACTIONS_REPOSITORY,
      useExisting: TransactionsRepository,
    },
    TransactionsService,
  ],
  exports: [TRANSACTIONS_REPOSITORY, TransactionsRepository, TransactionsService],
})
export class TransactionsModule {}
