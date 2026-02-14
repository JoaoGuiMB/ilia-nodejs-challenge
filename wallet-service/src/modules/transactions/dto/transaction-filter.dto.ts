import { IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '../../../common/types';

export class TransactionFilterDto {
  @IsOptional()
  @IsEnum(TransactionType)
  readonly type?: TransactionType;
}
