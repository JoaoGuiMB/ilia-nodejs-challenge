import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { BALANCE_SERVICE } from './interfaces/balance-service.interface';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [BalanceController],
  providers: [
    BalanceService,
    {
      provide: BALANCE_SERVICE,
      useExisting: BalanceService,
    },
  ],
  exports: [BALANCE_SERVICE, BalanceService],
})
export class BalanceModule {}
