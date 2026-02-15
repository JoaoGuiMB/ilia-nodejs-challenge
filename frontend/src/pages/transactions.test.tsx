import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { TransactionsPage } from './transactions'

const mockFetch = vi.fn()

const TRANSACTIONS_URL = 'http://localhost:3001/transactions'
const BALANCE_URL = 'http://localhost:3001/balance'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChakraProvider value={defaultSystem}>
            {children}
          </ChakraProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

const mockTransactions = [
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

const mockBalanceResponse = { amount: 250 }

function setupMockFetch(options: {
  transactions?: typeof mockTransactions | [];
  balance?: { amount: number };
  transactionError?: boolean;
  balanceError?: boolean;
} = {}) {
  const {
    transactions = mockTransactions,
    balance = mockBalanceResponse,
    transactionError = false,
    balanceError = false,
  } = options

  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/balance')) {
      if (balanceError) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: 'Balance fetch failed' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(balance),
      })
    }

    if (url.includes('/transactions')) {
      if (transactionError) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: 'Server error' }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(transactions),
      })
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  })
}

describe('TransactionsPage', () => {
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

  it('should render page title and description', () => {
    setupMockFetch({ transactions: [] })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('View and manage your transactions')).toBeInTheDocument()
  })

  it('should render loading state initially', () => {
    setupMockFetch({ transactions: [] })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument()
  })

  it('should render transaction list after loading', async () => {
    setupMockFetch()

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('+$100.00')).toBeInTheDocument()
    expect(screen.getByText('-$50.00')).toBeInTheDocument()
    expect(screen.getByText('+$200.00')).toBeInTheDocument()
  })

  it('should render empty state when no transactions', async () => {
    setupMockFetch({ transactions: [] })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
  })

  it('should render error state on API failure', async () => {
    setupMockFetch({ transactionError: true })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('should render filter controls', async () => {
    setupMockFetch()

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Credit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Debit' })).toBeInTheDocument()
  })

  it('should filter transactions when clicking filter buttons', async () => {
    const user = userEvent.setup()
    const creditOnly = mockTransactions.filter(t => t.type === 'CREDIT')

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/balance')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBalanceResponse),
        })
      }
      if (url.includes('type=CREDIT')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(creditOnly),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      })
    })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    // Click Credit filter
    await user.click(screen.getByRole('button', { name: 'Credit' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/transactions?type=CREDIT',
        expect.any(Object)
      )
    })
  })

  it('should render transaction form', async () => {
    setupMockFetch({ transactions: [] })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('New Transaction')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Transaction' })).toBeInTheDocument()
  })

  it('should have form with correct initial values', async () => {
    setupMockFetch({ transactions: [] })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    // Check form elements exist with correct attributes
    const amountInput = screen.getByPlaceholderText('Enter amount')
    expect(amountInput).toHaveAttribute('type', 'number')
    expect(amountInput).toHaveAttribute('step', '0.01')

    // Hidden type input should be CREDIT by default
    const hiddenInput = document.querySelector('input[name="type"]') as HTMLInputElement
    expect(hiddenInput.value).toBe('CREDIT')
  })

  // Balance Card Tests
  describe('Balance Display', () => {
    it('should render balance card with correct amount', async () => {
      setupMockFetch({ balance: { amount: 1500.50 } })

      render(<TransactionsPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('$1,500.50')).toBeInTheDocument()
      })

      expect(screen.getByText('Current Balance')).toBeInTheDocument()
    })

    it('should show loading state for balance while fetching', () => {
      // Mock a delayed balance response
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/balance')) {
          return new Promise(() => {})
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<TransactionsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Loading your balance...')).toBeInTheDocument()
    })

    it('should show error state for balance with retry button', async () => {
      setupMockFetch({ balanceError: true, transactions: [] })

      render(<TransactionsPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Balance fetch failed')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    })

    it('should retry fetching balance when retry button is clicked', async () => {
      const user = userEvent.setup()
      let balanceCallCount = 0

      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/balance')) {
          balanceCallCount++
          if (balanceCallCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ message: 'Balance fetch failed' }),
            })
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ amount: 500 }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      })

      render(<TransactionsPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Balance fetch failed')).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: 'Try Again' })
      await user.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('$500.00')).toBeInTheDocument()
      })
    })

    it('should display correct balance amount with formatting', async () => {
      setupMockFetch({ balance: { amount: 12345.67 } })

      render(<TransactionsPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('$12,345.67')).toBeInTheDocument()
      })
    })

    it('should display zero balance correctly', async () => {
      setupMockFetch({ balance: { amount: 0 } })

      render(<TransactionsPage />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('$0.00')).toBeInTheDocument()
      })
    })
  })
})
