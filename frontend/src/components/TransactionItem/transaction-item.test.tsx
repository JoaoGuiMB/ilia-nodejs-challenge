import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { TransactionItem } from '.'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>
      {ui}
    </ChakraProvider>
  )
}

describe('TransactionItem', () => {
  it('should render credit transaction with green color and positive sign', () => {
    renderWithProviders(
      <TransactionItem
        type="CREDIT"
        amount={100}
        date="2026-01-15T10:30:00Z"
      />
    )

    expect(screen.getByText('Credit')).toBeInTheDocument()
    expect(screen.getByText('+$100.00')).toBeInTheDocument()
    expect(screen.getByText('↑')).toBeInTheDocument()
  })

  it('should render debit transaction with red color and negative sign', () => {
    renderWithProviders(
      <TransactionItem
        type="DEBIT"
        amount={50.50}
        date="2026-01-15T10:30:00Z"
      />
    )

    expect(screen.getByText('Debit')).toBeInTheDocument()
    expect(screen.getByText('-$50.50')).toBeInTheDocument()
    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('should format large amounts correctly', () => {
    renderWithProviders(
      <TransactionItem
        type="CREDIT"
        amount={1234567.89}
        date="2026-01-15T10:30:00Z"
      />
    )

    expect(screen.getByText('+$1,234,567.89')).toBeInTheDocument()
  })

  it('should display formatted date', () => {
    renderWithProviders(
      <TransactionItem
        type="CREDIT"
        amount={100}
        date="2026-01-15T10:30:00Z"
      />
    )

    // The date format includes month, day, year, and time
    const dateText = screen.getByText(/Jan 15, 2026/i)
    expect(dateText).toBeInTheDocument()
  })

  it('should display up arrow for credit transactions', () => {
    renderWithProviders(
      <TransactionItem
        type="CREDIT"
        amount={100}
        date="2026-01-15T10:30:00Z"
      />
    )

    expect(screen.getByText('↑')).toBeInTheDocument()
    expect(screen.getByText('+$100.00')).toBeInTheDocument()
  })

  it('should display down arrow for debit transactions', () => {
    renderWithProviders(
      <TransactionItem
        type="DEBIT"
        amount={100}
        date="2026-01-15T10:30:00Z"
      />
    )

    expect(screen.getByText('↓')).toBeInTheDocument()
    expect(screen.getByText('-$100.00')).toBeInTheDocument()
  })
})
