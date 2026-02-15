import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { RegisterPage } from './register'
import { system } from '@/theme'

const mockFetch = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        <AuthProvider>
          <MemoryRouter>
            {children}
          </MemoryRouter>
        </AuthProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
    mockNavigate.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should render register form', () => {
    render(<RegisterPage />, { wrapper: TestWrapper })

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty form', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />, { wrapper: TestWrapper })

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })
  })

  it('should not submit form with invalid email', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />, { wrapper: TestWrapper })

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    // Form should not call the API with invalid email due to HTML5 validation
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should show validation error for short password', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />, { wrapper: TestWrapper })

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'short')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('should call register API on valid form submission', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<RegisterPage />, { wrapper: TestWrapper })

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        })
      )
    })
  })

  it('should show error message on registration failure', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ message: 'Email already exists' }),
    })

    render(<RegisterPage />, { wrapper: TestWrapper })

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('should navigate to login on successful registration', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<RegisterPage />, { wrapper: TestWrapper })

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { registered: true } })
    })
  })

  it('should have link to login page', () => {
    render(<RegisterPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })
})
