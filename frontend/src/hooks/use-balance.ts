import { useQuery } from '@tanstack/react-query'
import { walletApi } from '@/services/api'

interface UseBalanceResult {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBalance(): UseBalanceResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await walletApi.getBalance()
      return response.amount
    },
  })

  return {
    balance: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: async () => {
      await refetch()
    },
  }
}
