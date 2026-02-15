import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { TransactionList } from '.'
import type { TransactionResponse } from '@/types'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>
      {ui}
    </ChakraProvider>
  )
}

const mockTransactions: TransactionResponse[] = [
  {
    id: '1',
    user_id: 'user-1',
    type: 'CREDIT',
    amount: 100,
    created_at: '2026-01-01T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    type: 'DEBIT',
    amount: 50,
    created_at: '2026-01-02T10:00:00Z',
  },
]

describe('TransactionList', () => {
  it('should render all transactions', () => {
    renderWithProviders(<TransactionList transactions={mockTransactions} />)

    expect(screen.getByText('Credit')).toBeInTheDocument()
    expect(screen.getByText('Debit')).toBeInTheDocument()
    expect(screen.getByText('+$100.00')).toBeInTheDocument()
    expect(screen.getByText('-$50.00')).toBeInTheDocument()
  })

  it('should render empty state when no transactions', () => {
    renderWithProviders(<TransactionList transactions={[]} />)

    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
    expect(screen.getByText(/Create your first transaction/i)).toBeInTheDocument()
  })

  it('should render multiple transactions in order', () => {
    const transactions: TransactionResponse[] = [
      {
        id: '1',
        user_id: 'user-1',
        type: 'CREDIT',
        amount: 100,
        created_at: '2026-01-01T10:00:00Z',
      },
      {
        id: '2',
        user_id: 'user-1',
        type: 'CREDIT',
        amount: 200,
        created_at: '2026-01-02T10:00:00Z',
      },
      {
        id: '3',
        user_id: 'user-1',
        type: 'DEBIT',
        amount: 75,
        created_at: '2026-01-03T10:00:00Z',
      },
    ]

    renderWithProviders(<TransactionList transactions={transactions} />)

    expect(screen.getByText('+$100.00')).toBeInTheDocument()
    expect(screen.getByText('+$200.00')).toBeInTheDocument()
    expect(screen.getByText('-$75.00')).toBeInTheDocument()
  })
})
