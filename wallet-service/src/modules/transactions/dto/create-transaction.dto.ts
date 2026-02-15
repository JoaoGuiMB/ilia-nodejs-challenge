import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { TransactionType } from '../../../common/types';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  readonly type: TransactionType;

  @IsNumber()
  @IsPositive()
  readonly amount: number;
}
