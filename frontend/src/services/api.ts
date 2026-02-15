import type { AuthResponse, UserResponse, TransactionResponse, BalanceResponse, PaginatedResponse } from '@/types'
import type { LoginFormData, CreateUserFormData } from '@/schemas'

const USERS_API_URL = import.meta.env.VITE_USERS_API_URL || 'http://localhost:3002'
const WALLET_API_URL = import.meta.env.VITE_WALLET_API_URL || 'http://localhost:3001'

const TOKEN_KEY = 'access_token'

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export interface GetTransactionsParams {
  type?: string;
  page?: number;
  limit?: number;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(url, { ...fetchOptions, headers })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const usersApi = {
  login: (data: LoginFormData) =>
    fetchWithAuth<AuthResponse>(`${USERS_API_URL}/auth`, {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  register: (data: CreateUserFormData) =>
    fetchWithAuth<UserResponse>(`${USERS_API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  getProfile: (id: string) =>
    fetchWithAuth<UserResponse>(`${USERS_API_URL}/users/${id}`),
}

export const walletApi = {
  getBalance: () =>
    fetchWithAuth<BalanceResponse>(`${WALLET_API_URL}/balance`),

  getTransactions: (params: GetTransactionsParams = {}) => {
    const { type, page = 1, limit = 8 } = params
    const searchParams = new URLSearchParams()
    searchParams.set('page', String(page))
    searchParams.set('limit', String(limit))
    if (type) {
      searchParams.set('type', type)
    }
    return fetchWithAuth<PaginatedResponse<TransactionResponse>>(
      `${WALLET_API_URL}/transactions?${searchParams.toString()}`
    )
  },

  createTransaction: (data: { type: 'CREDIT' | 'DEBIT'; amount: number }) =>
    fetchWithAuth<TransactionResponse>(`${WALLET_API_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
