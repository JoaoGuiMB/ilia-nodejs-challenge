import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

  it('should render button with current language and flag', () => {
    renderWithProviders(<LanguageSwitcher />)

    const button = screen.getByRole('button', { name: /select language/i })
    expect(button).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByAltText('USA flag')).toBeInTheDocument()
  })

  it('should open menu when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LanguageSwitcher />)

    const button = screen.getByRole('button', { name: /select language/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  it('should show all language options with flags', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LanguageSwitcher />)

    const button = screen.getByRole('button', { name: /select language/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /english/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /português/i })).toBeInTheDocument()
    })

    const flagImages = screen.getAllByRole('img')
    expect(flagImages.length).toBeGreaterThanOrEqual(2)
  })

  it('should change language to Portuguese when clicking PT option', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LanguageSwitcher />)

    const button = screen.getByRole('button', { name: /select language/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const ptOption = screen.getByRole('menuitem', { name: /português/i })
    await user.click(ptOption)

    expect(i18n.language).toBe('pt')
  })

  it('should change language to English when clicking EN option', async () => {
    const user = userEvent.setup()
    i18n.changeLanguage('pt')
    renderWithProviders(<LanguageSwitcher />)

    // When language is Portuguese, aria-label is translated
    const button = screen.getByRole('button', { name: /selecionar idioma/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const enOption = screen.getByRole('menuitem', { name: /english/i })
    await user.click(enOption)

    expect(i18n.language).toBe('en')
  })

  it('should close menu after selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LanguageSwitcher />)

    const button = screen.getByRole('button', { name: /select language/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const ptOption = screen.getByRole('menuitem', { name: /português/i })
    await user.click(ptOption)

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('should display current language correctly when set to Portuguese', () => {
    i18n.changeLanguage('pt')
    renderWithProviders(<LanguageSwitcher />)

    expect(screen.getByText('Português')).toBeInTheDocument()
    expect(screen.getByAltText('Brazil flag')).toBeInTheDocument()
  })
})
