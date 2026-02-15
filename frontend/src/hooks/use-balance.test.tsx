import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useBalance } from './use-balance'

const mockFetch = vi.fn()

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
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

describe('useBalance', () => {
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
      json: () => Promise.resolve({ amount: 100 }),
    })

    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.balance).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should fetch and return balance', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ amount: 1500.50 }),
    })

    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.balance).toBe(1500.50)
    expect(result.current.error).toBeNull()
  })

  it('should handle loading state correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ amount: 100 }),
    })

    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should handle error state', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server error' }),
    })

    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Server error')
    expect(result.current.balance).toBeNull()
  })

  it('should handle network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.balance).toBeNull()
  })

  it('should refetch balance when refetch is called', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ amount: 100 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ amount: 200 }),
      })

    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.balance).toBe(100)

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.balance).toBe(200)
    })
  })

  it('should clear error on successful refetch', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ amount: 100 }),
      })

    const { result } = renderHook(() => useBalance(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.error).toBe('Error')
    })

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
    expect(result.current.balance).toBe(100)
  })
})
