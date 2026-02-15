import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { LoginPage } from './login'
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

describe('LoginPage', () => {
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

  it('should render login form', () => {
    render(<LoginPage />, { wrapper: TestWrapper })

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty form', async () => {
    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: TestWrapper })

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('should not submit form with invalid input', async () => {
    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: TestWrapper })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    // Type invalid email - HTML5 validation will prevent form submission
    await user.type(emailInput, 'test')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Form should not call the API with invalid email due to HTML5 validation
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should call login API on valid form submission', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      user: { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      access_token: 'test-token',
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<LoginPage />, { wrapper: TestWrapper })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'john@example.com', password: 'password123' }),
        })
      )
    })
  })

  it('should show error message on login failure', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Invalid credentials' }),
    })

    render(<LoginPage />, { wrapper: TestWrapper })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'wrongpassword')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should navigate to dashboard on successful login', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      user: { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      access_token: 'test-token',
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<LoginPage />, { wrapper: TestWrapper })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
  })

  it('should have link to register page', () => {
    render(<LoginPage />, { wrapper: TestWrapper })

    expect(screen.getByText(/create one/i)).toBeInTheDocument()
  })
})
