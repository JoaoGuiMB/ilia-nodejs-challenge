import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWithAuth, getToken, setToken, removeToken } from './api'

describe('Token management', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should store token in localStorage', () => {
    const token = 'test-token-123'
    setToken(token)
    expect(localStorage.getItem('access_token')).toBe(token)
  })

  it('should retrieve token from localStorage', () => {
    const token = 'test-token-123'
    localStorage.setItem('access_token', token)
    expect(getToken()).toBe(token)
  })

  it('should return null when no token exists', () => {
    expect(getToken()).toBeNull()
  })

  it('should remove token from localStorage', () => {
    localStorage.setItem('access_token', 'test-token')
    removeToken()
    expect(localStorage.getItem('access_token')).toBeNull()
  })
})

describe('fetchWithAuth', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should add Authorization header when token exists', async () => {
    const token = 'test-token-123'
    setToken(token)

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    })

    await fetchWithAuth('http://test.com/api')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.com/api',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      })
    )
  })

  it('should not add Authorization header when skipAuth is true', async () => {
    const token = 'test-token-123'
    setToken(token)

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    })

    await fetchWithAuth('http://test.com/api', { skipAuth: true })

    const callHeaders = mockFetch.mock.calls[0][1].headers
    expect(callHeaders.Authorization).toBeUndefined()
  })

  it('should not add Authorization header when no token exists', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    })

    await fetchWithAuth('http://test.com/api')

    const callHeaders = mockFetch.mock.calls[0][1].headers
    expect(callHeaders.Authorization).toBeUndefined()
  })

  it('should throw error on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    })

    await expect(fetchWithAuth('http://test.com/api')).rejects.toThrow('Unauthorized')
  })

  it('should handle response without json body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('No JSON')),
    })

    await expect(fetchWithAuth('http://test.com/api')).rejects.toThrow('Request failed')
  })

  it('should include Content-Type header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await fetchWithAuth('http://test.com/api')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.com/api',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should pass request body for POST requests', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const body = JSON.stringify({ email: 'test@test.com' })
    await fetchWithAuth('http://test.com/api', {
      method: 'POST',
      body,
      skipAuth: true,
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.com/api',
      expect.objectContaining({
        method: 'POST',
        body,
      })
    )
  })
})
