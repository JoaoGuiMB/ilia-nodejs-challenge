export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export interface TransactionResponse {
  id: string;
  user_id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  created_at: string;
}

export interface BalanceResponse {
  amount: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
