import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import i18n from 'i18next'
import { LanguageSwitcher } from './language-switcher'
import { system } from '@/theme'

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider value={system}>
      {ui}
    </ChakraProvider>
  )
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    i18n.changeLanguage('en')
  })

  it('should render language buttons', () => {
    renderWithProviders(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: /EN language/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /PT language/i })).toBeInTheDocument()
  })

  it('should have EN button active when language is English', () => {
    renderWithProviders(<LanguageSwitcher />)

    const enButton = screen.getByRole('button', { name: /EN language/i })
    expect(enButton).toHaveAttribute('aria-pressed', 'true')

    const ptButton = screen.getByRole('button', { name: /PT language/i })
    expect(ptButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should change language to Portuguese when clicking PT button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LanguageSwitcher />)

    const ptButton = screen.getByRole('button', { name: /PT language/i })
    await user.click(ptButton)

    expect(i18n.language).toBe('pt')
  })

  it('should change language to English when clicking EN button', async () => {
    const user = userEvent.setup()
    i18n.changeLanguage('pt')
    renderWithProviders(<LanguageSwitcher />)

    const enButton = screen.getByRole('button', { name: /EN language/i })
    await user.click(enButton)

    expect(i18n.language).toBe('en')
  })

  it('should have correct aria-label for the group', () => {
    renderWithProviders(<LanguageSwitcher />)

    const group = screen.getByRole('group', { name: /select language/i })
    expect(group).toBeInTheDocument()
  })

  it('should update aria-pressed when language changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LanguageSwitcher />)

    const ptButton = screen.getByRole('button', { name: /PT language/i })
    await user.click(ptButton)

    expect(ptButton).toHaveAttribute('aria-pressed', 'true')

    const enButton = screen.getByRole('button', { name: /EN language/i })
    expect(enButton).toHaveAttribute('aria-pressed', 'false')
  })
})
