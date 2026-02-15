import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletApi } from '@/services/api'
import type { TransactionResponse } from '@/types'

export type TransactionFilter = 'ALL' | 'CREDIT' | 'DEBIT'

interface UseTransactionsResult {
  transactions: TransactionResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactions(filter: TransactionFilter = 'ALL'): UseTransactionsResult {
  const typeParam = filter === 'ALL' ? undefined : filter

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: async () => {
      const response = await walletApi.getTransactions(typeParam)
      return response
    },
  })

  return {
    transactions: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: async () => {
      await refetch()
    },
  }
}

interface CreateTransactionInput {
  type: 'CREDIT' | 'DEBIT';
  amount: number;
}

interface UseCreateTransactionResult {
  createTransaction: (data: CreateTransactionInput) => Promise<TransactionResponse>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateTransaction(): UseCreateTransactionResult {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const response = await walletApi.createTransaction(data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['balance'] })
    },
  })

  return {
    createTransaction: async (data: CreateTransactionInput) => {
      return mutation.mutateAsync(data)
    },
    isLoading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  }
}
