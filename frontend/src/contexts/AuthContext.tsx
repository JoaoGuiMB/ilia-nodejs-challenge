import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { UserResponse } from '@/types'
import type { LoginFormData } from '@/schemas'
import { usersApi, setToken, removeToken, getToken } from '@/services/api'

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()
      if (token) {
        try {
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            setUser(JSON.parse(storedUser))
          }
        } catch {
          removeToken()
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (data: LoginFormData) => {
    const response = await usersApi.login(data)
    setToken(response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    removeToken()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
