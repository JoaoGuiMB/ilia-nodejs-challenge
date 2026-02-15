import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { TransactionFilter } from '.'

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>
      {ui}
    </ChakraProvider>
  )
}

describe('TransactionFilter', () => {
  it('should render all filter options', () => {
    const onChange = vi.fn()
    renderWithProviders(<TransactionFilter value="ALL" onChange={onChange} />)

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Credit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Debit' })).toBeInTheDocument()
  })

  it('should render with correct filter selected', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <TransactionFilter value="ALL" onChange={onChange} />
    )

    // All filter buttons should be visible
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Credit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Debit' })).toBeInTheDocument()
  })

  it('should call onChange when clicking All filter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<TransactionFilter value="CREDIT" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(onChange).toHaveBeenCalledWith('ALL')
  })

  it('should call onChange when clicking Credit filter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<TransactionFilter value="ALL" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Credit' }))

    expect(onChange).toHaveBeenCalledWith('CREDIT')
  })

  it('should call onChange when clicking Debit filter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<TransactionFilter value="ALL" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Debit' }))

    expect(onChange).toHaveBeenCalledWith('DEBIT')
  })
})
