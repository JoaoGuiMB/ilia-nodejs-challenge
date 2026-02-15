export interface UserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthResponse {
  user: UserResponse;
  access_token: string;
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

export interface ApiError {
  message: string;
  statusCode?: number;
}
