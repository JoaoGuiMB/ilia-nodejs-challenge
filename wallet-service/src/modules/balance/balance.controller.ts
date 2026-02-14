import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { BalanceResponse } from './interfaces/balance-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Balance')
@ApiBearerAuth('JWT-auth')
@Controller('balance')
@UseGuards(JwtAuthGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user balance',
    description:
      'Returns the calculated balance for the authenticated user. Balance is calculated as sum of CREDIT transactions minus sum of DEBIT transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'User balance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          example: 250.5,
          description: 'Current balance amount',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getBalance(
    @CurrentUser('sub') userId: string,
  ): Promise<BalanceResponse> {
    return this.balanceService.getBalance(userId);
  }
}
