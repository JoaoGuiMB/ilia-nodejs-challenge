import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface CreateTransactionRequest {
  userId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
}

export interface TransactionResponse {
  id: string;
  user_id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  created_at: string;
}

@Injectable()
export class WalletClientService {
  private readonly logger = new Logger(WalletClientService.name);
  private readonly walletServiceUrl: string;
  private readonly jwtInternalSecret: string;

  constructor(private readonly configService: ConfigService) {
    const walletUrl = configService.get<string>('WALLET_SERVICE_URL');
    const internalSecret = configService.get<string>('JWT_INTERNAL_SECRET');

    if (!walletUrl) {
      throw new Error('WALLET_SERVICE_URL is not defined');
    }

    if (!internalSecret) {
      throw new Error('JWT_INTERNAL_SECRET is not defined');
    }

    this.walletServiceUrl = walletUrl;
    this.jwtInternalSecret = internalSecret;
  }

  generateInternalToken(): string {
    const payload = {
      sub: 'users-service',
      email: 'internal@service.local',
      type: 'internal',
    };

    return jwt.sign(payload, this.jwtInternalSecret, { expiresIn: '5m' });
  }

  async createTransaction(request: CreateTransactionRequest): Promise<TransactionResponse> {
    const internalToken = this.generateInternalToken();

    this.logger.log(
      `Creating transaction for user ${request.userId}: ${request.type} ${request.amount}`,
    );

    const response = await fetch(
      `${this.walletServiceUrl}/internal/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${internalToken}`,
        },
        body: JSON.stringify({
          userId: request.userId,
          type: request.type,
          amount: request.amount,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(
        `Wallet service error: ${response.status} - ${errorBody}`,
      );
      throw new InternalServerErrorException(
        `Wallet service error: ${response.status}`,
      );
    }

    const transaction = (await response.json()) as TransactionResponse;
    this.logger.log(`Transaction ${transaction.id} created successfully`);

    return transaction;
  }
}
