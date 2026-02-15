import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransactionForm } from '.'

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
        <ChakraProvider value={defaultSystem}>
          {children}
        </ChakraProvider>
      </QueryClientProvider>
    )
  }
}

describe('TransactionForm', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should render form with all elements', () => {
    render(<TransactionForm />, { wrapper: createWrapper() })

    expect(screen.getByText('New Transaction')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Amount ($)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Credit (+)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Debit (-)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Transaction' })).toBeInTheDocument()
  })

  it('should default to CREDIT type', () => {
    render(<TransactionForm />, { wrapper: createWrapper() })

    // Hidden input should have CREDIT value
    const hiddenInput = document.querySelector('input[name="type"]') as HTMLInputElement
    expect(hiddenInput.value).toBe('CREDIT')
  })

  it('should switch transaction type when clicking buttons', async () => {
    const user = userEvent.setup()
    render(<TransactionForm />, { wrapper: createWrapper() })

    const debitButton = screen.getByRole('button', { name: 'Debit (-)' })
    await user.click(debitButton)

    // Hidden input should now have DEBIT value
    const hiddenInput = document.querySelector('input[name="type"]') as HTMLInputElement
    expect(hiddenInput.value).toBe('DEBIT')
  })

  it('should show validation error for empty amount', async () => {
    const user = userEvent.setup()
    render(<TransactionForm />, { wrapper: createWrapper() })

    const submitButton = screen.getByRole('button', { name: 'Create Transaction' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Amount must be a positive number/i)).toBeInTheDocument()
    })
  })

  it('should render amount input with correct attributes', () => {
    render(<TransactionForm />, { wrapper: createWrapper() })

    const amountInput = screen.getByPlaceholderText('Enter amount')
    expect(amountInput).toHaveAttribute('type', 'number')
    expect(amountInput).toHaveAttribute('step', '0.01')
    expect(amountInput).toHaveAttribute('min', '0.01')
  })

  it('should allow typing amount value', async () => {
    const user = userEvent.setup()
    render(<TransactionForm />, { wrapper: createWrapper() })

    const amountInput = screen.getByPlaceholderText('Enter amount')
    await user.type(amountInput, '100.50')

    expect(amountInput).toHaveValue(100.50)
  })

  it('should switch to CREDIT type when clicking credit button', async () => {
    const user = userEvent.setup()
    render(<TransactionForm />, { wrapper: createWrapper() })

    // First click DEBIT
    const debitButton = screen.getByRole('button', { name: 'Debit (-)' })
    await user.click(debitButton)

    let hiddenInput = document.querySelector('input[name="type"]') as HTMLInputElement
    expect(hiddenInput.value).toBe('DEBIT')

    // Then click CREDIT
    const creditButton = screen.getByRole('button', { name: 'Credit (+)' })
    await user.click(creditButton)

    hiddenInput = document.querySelector('input[name="type"]') as HTMLInputElement
    expect(hiddenInput.value).toBe('CREDIT')
  })
})
