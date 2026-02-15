import { BalanceResponse } from './balance-response.interface';

export interface IBalanceService {
  getBalance(userId: string): Promise<BalanceResponse>;
}

export const BALANCE_SERVICE = Symbol('BALANCE_SERVICE');
