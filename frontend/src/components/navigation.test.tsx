import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { Navigation } from './navigation'

function renderWithProviders(ui: React.ReactElement, initialRoute = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
    </MemoryRouter>
  )
}

describe('Navigation', () => {
  it('should render Dashboard link', () => {
    renderWithProviders(<Navigation />)

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('should render Transactions link', () => {
    renderWithProviders(<Navigation />)

    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument()
  })

  it('should have correct href for Dashboard link', () => {
    renderWithProviders(<Navigation />)

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })

  it('should have correct href for Transactions link', () => {
    renderWithProviders(<Navigation />)

    const transactionsLink = screen.getByRole('link', { name: /transactions/i })
    expect(transactionsLink).toHaveAttribute('href', '/transactions')
  })
})
