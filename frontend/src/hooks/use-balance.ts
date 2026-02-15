import { useState, useEffect, useCallback } from 'react'
import { walletApi } from '@/services/api'

interface UseBalanceResult {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBalance(): UseBalanceResult {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await walletApi.getBalance()
      setBalance(response.amount)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance'
      setError(errorMessage)
      setBalance(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  }
}
