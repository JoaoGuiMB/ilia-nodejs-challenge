import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateInternalTransactionDto } from './dto/create-internal-transaction.dto';
import { TransactionResponse } from './interfaces/transaction-response.interface';
import { InternalAuthGuard } from '../auth/guards/internal-auth.guard';

@ApiTags('Internal Transactions')
@ApiBearerAuth('Internal-JWT')
@Controller('internal/transactions')
@UseGuards(InternalAuthGuard)
export class InternalTransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a transaction via internal service call',
    description:
      'Creates a new transaction using internal service-to-service authentication. Requires JWT_INTERNAL_SECRET token.',
  })
  @ApiBody({
    description: 'Internal transaction data',
    schema: {
      type: 'object',
      required: ['userId', 'type', 'amount'],
      properties: {
        userId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        type: {
          type: 'string',
          enum: ['CREDIT', 'DEBIT'],
          example: 'CREDIT',
        },
        amount: {
          type: 'number',
          minimum: 0.01,
          example: 100.5,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
        amount: { type: 'number' },
        created_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing internal JWT token',
  })
  async create(
    @Body() createInternalTransactionDto: CreateInternalTransactionDto,
  ): Promise<TransactionResponse> {
    return this.transactionsService.create(createInternalTransactionDto.userId, {
      type: createInternalTransactionDto.type,
      amount: createInternalTransactionDto.amount,
    });
  }
}
