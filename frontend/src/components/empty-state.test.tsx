import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { EmptyState } from './empty-state'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>
      {ui}
    </ChakraProvider>
  )
}

describe('EmptyState', () => {
  it('should render title', () => {
    renderWithProviders(<EmptyState title="No items found" />)

    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('should render title and description', () => {
    renderWithProviders(
      <EmptyState
        title="No transactions"
        description="Create your first transaction to get started."
      />
    )

    expect(screen.getByText('No transactions')).toBeInTheDocument()
    expect(screen.getByText('Create your first transaction to get started.')).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    renderWithProviders(<EmptyState title="Empty" />)

    expect(screen.getByText('Empty')).toBeInTheDocument()
    // Description should not be present
    expect(screen.queryByText(/get started/i)).not.toBeInTheDocument()
  })
})
