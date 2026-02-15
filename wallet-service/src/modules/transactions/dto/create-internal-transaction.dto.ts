import { IsEnum, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { TransactionType } from '../../../common/types';

export class CreateInternalTransactionDto {
  @IsUUID()
  readonly userId: string;

  @IsEnum(TransactionType)
  readonly type: TransactionType;

  @IsNumber()
  @IsPositive()
  readonly amount: number;
}
