import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { SkipLink } from '.'
import { system } from '@/theme'

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider value={system}>
      {ui}
    </ChakraProvider>
  )
}

describe('SkipLink', () => {
  it('should render skip link with correct text', () => {
    renderWithProviders(<SkipLink />)

    const skipLink = screen.getByText(/skip to main content/i)
    expect(skipLink).toBeInTheDocument()
  })

  it('should have correct href attribute', () => {
    renderWithProviders(<SkipLink />)

    const skipLink = screen.getByText(/skip to main content/i)
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  it('should be a link element', () => {
    renderWithProviders(<SkipLink />)

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink).toBeInTheDocument()
  })
})
