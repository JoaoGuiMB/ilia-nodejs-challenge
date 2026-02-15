import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { BalanceCard } from '.'

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>)
}

describe('BalanceCard', () => {
  it('should render the balance label', () => {
    renderWithChakra(<BalanceCard balance={1000} />)

    expect(screen.getByText('Current Balance')).toBeInTheDocument()
  })

  it('should format positive balance as currency', () => {
    renderWithChakra(<BalanceCard balance={1234.56} />)

    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
  })

  it('should format zero balance', () => {
    renderWithChakra(<BalanceCard balance={0} />)

    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('should format large balance with commas', () => {
    renderWithChakra(<BalanceCard balance={999999.99} />)

    expect(screen.getByText('$999,999.99')).toBeInTheDocument()
  })

  it('should format negative balance', () => {
    renderWithChakra(<BalanceCard balance={-500} />)

    expect(screen.getByText('-$500.00')).toBeInTheDocument()
  })

  it('should format decimal amounts with 2 decimal places', () => {
    renderWithChakra(<BalanceCard balance={100.5} />)

    expect(screen.getByText('$100.50')).toBeInTheDocument()
  })
})
