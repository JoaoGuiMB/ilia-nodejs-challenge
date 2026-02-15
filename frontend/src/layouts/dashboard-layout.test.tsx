import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { DashboardLayout } from './dashboard-layout'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderWithProviders(initialRoute = '/transactions') {
  const mockUser = {
    id: '1',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
  }
  localStorage.setItem('access_token', 'test-token')
  localStorage.setItem('user', JSON.stringify(mockUser))

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ChakraProvider value={defaultSystem}>
        <AuthProvider>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/transactions" element={<div>Transactions Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </ChakraProvider>
    </MemoryRouter>
  )
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockReset()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should render the header with app name', async () => {
    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByText('FinTech Wallet')).toBeInTheDocument()
    })
  })

  it('should render sign out button', async () => {
    renderWithProviders()

    await waitFor(() => {
      const signOutButtons = screen.getAllByRole('button', { name: /sign out/i })
      expect(signOutButtons.length).toBeGreaterThan(0)
    })
  })

  it('should render outlet content', async () => {
    renderWithProviders('/transactions')

    await waitFor(() => {
      expect(screen.getByText('Transactions Content')).toBeInTheDocument()
    })
  })

  it('should clear auth and navigate to login on logout', async () => {
    const user = userEvent.setup()
    renderWithProviders()

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /sign out/i }).length).toBeGreaterThan(0)
    })

    const signOutButtons = screen.getAllByRole('button', { name: /sign out/i })
    await user.click(signOutButtons[0])

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
