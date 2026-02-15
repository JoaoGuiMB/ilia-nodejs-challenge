import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { DashboardPage } from './dashboard'

const mockFetch = vi.fn()

function renderWithProviders(ui: React.ReactElement) {
  const mockUser = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
  }
  localStorage.setItem('access_token', 'test-token')
  localStorage.setItem('user', JSON.stringify(mockUser))

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ChakraProvider value={defaultSystem}>
          <AuthProvider>{ui}</AuthProvider>
        </ChakraProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should render welcome message with user first name', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ amount: 100 }),
    })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/welcome back, john!/i)).toBeInTheDocument()
    })
  })

  it('should show loading spinner while fetching balance', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText(/loading your balance/i)).toBeInTheDocument()
  })

  it('should render balance card after loading', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ amount: 1500.50 }),
    })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('$1,500.50')).toBeInTheDocument()
    })

    expect(screen.getByText('Current Balance')).toBeInTheDocument()
  })

  it('should show error message on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Failed to fetch balance' }),
    })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch balance')).toBeInTheDocument()
    })
  })

  it('should show retry button on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Error' }),
    })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  it('should refetch balance when retry button is clicked', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ amount: 500 }),
      })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /try again/i }))

    await waitFor(() => {
      expect(screen.getByText('$500.00')).toBeInTheDocument()
    })
  })

  it('should not show loading or error when balance is displayed', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ amount: 100 }),
    })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('$100.00')).toBeInTheDocument()
    })

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('should render quick action buttons when balance is loaded', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ amount: 100 }),
    })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('$100.00')).toBeInTheDocument()
    })

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+ add credit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /- add debit/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view all transactions/i })).toBeInTheDocument()
  })

  it('should open quick transaction modal when clicking Add Credit', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ amount: 100 }),
    })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('$100.00')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /\+ add credit/i }))

    await waitFor(() => {
      expect(screen.getByText('Quick Transaction')).toBeInTheDocument()
    })
  })

  it('should open quick transaction modal when clicking Add Debit', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ amount: 100 }),
    })

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('$100.00')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /- add debit/i }))

    await waitFor(() => {
      expect(screen.getByText('Quick Transaction')).toBeInTheDocument()
    })
  })
})
