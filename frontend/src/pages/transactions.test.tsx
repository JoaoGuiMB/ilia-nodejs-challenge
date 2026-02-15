import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { TransactionsPage } from './transactions'

const mockFetch = vi.fn()

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
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('View and manage your transactions')).toBeInTheDocument()
  })

  it('should render loading state initially', () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument()
  })

  it('should render transaction list after loading', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTransactions),
    })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('+$100.00')).toBeInTheDocument()
    expect(screen.getByText('-$50.00')).toBeInTheDocument()
    expect(screen.getByText('+$200.00')).toBeInTheDocument()
  })

  it('should render empty state when no transactions', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
  })

  it('should render error state on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server error' }),
    })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('should render filter controls', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTransactions),
    })

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

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(creditOnly),
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
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    render(<TransactionsPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.queryByText('Loading transactions...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('New Transaction')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Transaction' })).toBeInTheDocument()
  })

  it('should have form with correct initial values', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

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
})
