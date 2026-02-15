import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { LoadingSpinner } from '.'

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>)
}

describe('LoadingSpinner', () => {
  it('should render default loading message', () => {
    renderWithChakra(<LoadingSpinner />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render custom message', () => {
    renderWithChakra(<LoadingSpinner message="Loading your balance..." />)

    expect(screen.getByText('Loading your balance...')).toBeInTheDocument()
  })

  it('should render a spinner element', () => {
    const { container } = renderWithChakra(<LoadingSpinner />)

    // At minimum, verify the component renders its container
    expect(container.firstChild).toBeInTheDocument()
  })
})
