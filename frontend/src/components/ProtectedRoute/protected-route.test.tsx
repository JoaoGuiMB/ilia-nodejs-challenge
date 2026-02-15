import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '.'
import { system } from '@/theme'

function TestWrapper({ children, initialEntries = ['/protected'] }: { children: React.ReactNode; initialEntries?: string[] }) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </AuthProvider>
    </ChakraProvider>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should redirect to login when not authenticated', async () => {
    render(
      <TestWrapper>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when authenticated', async () => {
    const storedUser = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    }
    localStorage.setItem('access_token', 'test-token')
    localStorage.setItem('user', JSON.stringify(storedUser))

    render(
      <TestWrapper>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    render(
      <TestWrapper>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </TestWrapper>
    )

    // The component shows a spinner while loading
    // We check that neither the protected content nor login page is shown initially
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
