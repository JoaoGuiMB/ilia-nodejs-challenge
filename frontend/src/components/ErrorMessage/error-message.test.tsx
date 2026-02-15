import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ErrorMessage } from '.'

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>)
}

describe('ErrorMessage', () => {
  it('should render error title', () => {
    renderWithChakra(<ErrorMessage message="Something went wrong" />)

    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should render error message', () => {
    renderWithChakra(<ErrorMessage message="Failed to fetch balance" />)

    expect(screen.getByText('Failed to fetch balance')).toBeInTheDocument()
  })

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    renderWithChakra(<ErrorMessage message="Error" onRetry={onRetry} />)

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('should not render retry button when onRetry is not provided', () => {
    renderWithChakra(<ErrorMessage message="Error" />)

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderWithChakra(<ErrorMessage message="Error" onRetry={onRetry} />)

    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
