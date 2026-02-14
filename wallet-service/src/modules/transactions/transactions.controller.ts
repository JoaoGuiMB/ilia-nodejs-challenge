import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionResponse } from './interfaces/transaction-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Creates a new CREDIT or DEBIT transaction for the authenticated user.',
  })
  @ApiBody({
    description: 'Transaction data',
    schema: {
      type: 'object',
      required: ['type', 'amount'],
      properties: {
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
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user transactions',
    description:
      'Returns all transactions for the authenticated user. Can be filtered by type.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['CREDIT', 'DEBIT'],
    description: 'Filter transactions by type',
  })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
          amount: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() filter: TransactionFilterDto,
  ): Promise<TransactionResponse[]> {
    return this.transactionsService.findAllByUser(userId, filter);
  }
}
