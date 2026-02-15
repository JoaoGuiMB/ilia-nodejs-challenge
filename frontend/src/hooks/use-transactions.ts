import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletApi } from '@/services/api'
import type { TransactionResponse, PaginatedResponse } from '@/types'

export type TransactionFilter = 'ALL' | 'CREDIT' | 'DEBIT'

const ITEMS_PER_PAGE = 8

interface UseTransactionsResult {
  transactions: TransactionResponse[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: string | null;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTransactions(filter: TransactionFilter = 'ALL'): UseTransactionsResult {
  const typeParam = filter === 'ALL' ? undefined : filter

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['transactions', filter],
    queryFn: async ({ pageParam }) => {
      const response = await walletApi.getTransactions({
        type: typeParam,
        page: pageParam,
        limit: ITEMS_PER_PAGE,
      })
      return response
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<TransactionResponse>) => {
      if (lastPage.meta.hasNextPage) {
        return lastPage.meta.page + 1
      }
      return undefined
    },
  })

  const transactions = data?.pages.flatMap((page) => page.data) ?? []

  return {
    transactions,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    error: error instanceof Error ? error.message : null,
    fetchNextPage: async () => {
      await fetchNextPage()
    },
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
      // Reset the infinite query to refetch from page 1
      queryClient.resetQueries({ queryKey: ['transactions'] })
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
