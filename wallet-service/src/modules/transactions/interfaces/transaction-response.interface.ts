export interface TransactionResponse {
  id: string;
  user_id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  created_at: string;
}
