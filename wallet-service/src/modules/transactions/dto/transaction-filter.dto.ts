import { IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '../../../common/types';
import { PaginationDto } from './pagination.dto';

export class TransactionFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TransactionType)
  readonly type?: TransactionType;
}
