import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTransactions, useCreateTransaction } from './use-transactions'
import type { PaginatedResponse, TransactionResponse } from '@/types'

const mockFetch = vi.fn()

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

const mockTransactions: TransactionResponse[] = [
  {
    id: '1',
    user_id: 'user-1',
    type: 'CREDIT' as const,
    amount: 100,
    created_at: '2026-01-01T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    type: 'DEBIT' as const,
    amount: 50,
    created_at: '2026-01-02T10:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    type: 'CREDIT' as const,
    amount: 200,
    created_at: '2026-01-03T10:00:00Z',
  },
]

function createPaginatedResponse(
  data: TransactionResponse[],
  page: number,
  total: number,
  limit = 8
): PaginatedResponse<TransactionResponse> {
  const totalPages = Math.ceil(total / limit)
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}

describe('useTransactions', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should start with loading state', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createPaginatedResponse([], 1, 0)),
    })

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.transactions).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should fetch and return paginated transactions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createPaginatedResponse(mockTransactions, 1, 3)),
    })

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.transactions).toEqual(mockTransactions)
    expect(result.current.error).toBeNull()
    expect(result.current.hasNextPage).toBe(false)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/transactions?page=1&limit=8',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    )
  })

  it('should filter transactions by CREDIT type with pagination', async () => {
    const creditTransactions = mockTransactions.filter(t => t.type === 'CREDIT')
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createPaginatedResponse(creditTransactions, 1, 2)),
    })

    const { result } = renderHook(() => useTransactions('CREDIT'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.transactions).toEqual(creditTransactions)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/transactions?page=1&limit=8&type=CREDIT',
      expect.any(Object)
    )
  })

  it('should filter transactions by DEBIT type with pagination', async () => {
    const debitTransactions = mockTransactions.filter(t => t.type === 'DEBIT')
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createPaginatedResponse(debitTransactions, 1, 1)),
    })

    const { result } = renderHook(() => useTransactions('DEBIT'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.transactions).toEqual(debitTransactions)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/transactions?page=1&limit=8&type=DEBIT',
      expect.any(Object)
    )
  })

  it('should not pass type param when filter is ALL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createPaginatedResponse(mockTransactions, 1, 3)),
    })

    const { result } = renderHook(() => useTransactions('ALL'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/transactions?page=1&limit=8',
      expect.any(Object)
    )
  })

  it('should handle error state', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server error' }),
    })

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Server error')
    expect(result.current.transactions).toEqual([])
  })

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.transactions).toEqual([])
  })

  it('should indicate hasNextPage when more pages available', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(createPaginatedResponse(mockTransactions.slice(0, 2), 1, 10)),
    })

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasNextPage).toBe(true)
  })

  it('should fetch next page when fetchNextPage is called', async () => {
    // Use limit of 2 to ensure there are multiple pages
    const page1Response = createPaginatedResponse(mockTransactions.slice(0, 2), 1, 3, 2)
    const page2Response = createPaginatedResponse([mockTransactions[2]], 2, 3, 2)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(page1Response),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(page2Response),
      })

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.transactions).toHaveLength(2)
    expect(result.current.hasNextPage).toBe(true)

    await act(async () => {
      await result.current.fetchNextPage()
    })

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(3)
    })

    expect(result.current.transactions).toEqual(mockTransactions)
  })

  it('should refetch transactions', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createPaginatedResponse([mockTransactions[0]], 1, 1)),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createPaginatedResponse(mockTransactions, 1, 3)),
      })

    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.transactions).toHaveLength(1)

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(3)
    })
  })
})

describe('useCreateTransaction', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should create a transaction successfully', async () => {
    const newTransaction = {
      id: '4',
      user_id: 'user-1',
      type: 'CREDIT' as const,
      amount: 500,
      created_at: '2026-01-04T10:00:00Z',
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(newTransaction),
    })

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()

    let createdTransaction
    await act(async () => {
      createdTransaction = await result.current.createTransaction({
        type: 'CREDIT',
        amount: 500,
      })
    })

    expect(createdTransaction).toEqual(newTransaction)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/transactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ type: 'CREDIT', amount: 500 }),
      })
    )
  })

  it('should handle creation error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Invalid amount' }),
    })

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() })

    await act(async () => {
      try {
        await result.current.createTransaction({
          type: 'DEBIT',
          amount: -100,
        })
      } catch {
        // Expected error
      }
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid amount')
    })
  })

  it('should show loading state during creation', async () => {
    let resolvePromise: (value: unknown) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockFetch.mockImplementation(() => pendingPromise)

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.createTransaction({
        type: 'CREDIT',
        amount: 100,
      })
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ id: '1', type: 'CREDIT', amount: 100 }),
      })
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})
