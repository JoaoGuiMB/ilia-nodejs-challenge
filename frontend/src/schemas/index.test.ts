import { describe, it, expect } from 'vitest'
import { loginSchema, createUserSchema } from './index'

describe('loginSchema', () => {
  it('should validate a valid login', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    }
    const result = loginSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('should reject empty password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })

  it('should reject missing email', () => {
    const invalidData = {
      password: 'password123',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject missing password', () => {
    const invalidData = {
      email: 'test@example.com',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('createUserSchema', () => {
  it('should validate a valid user creation', () => {
    const validData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
    }
    const result = createUserSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject empty first_name', () => {
    const invalidData = {
      first_name: '',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
    }
    const result = createUserSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('first_name')
    }
  })

  it('should reject first_name longer than 100 characters', () => {
    const invalidData = {
      first_name: 'a'.repeat(101),
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
    }
    const result = createUserSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('first_name')
    }
  })

  it('should reject empty last_name', () => {
    const invalidData = {
      first_name: 'John',
      last_name: '',
      email: 'john.doe@example.com',
      password: 'securePassword123',
    }
    const result = createUserSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('last_name')
    }
  })

  it('should reject invalid email', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'invalid-email',
      password: 'securePassword123',
    }
    const result = createUserSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('should reject password shorter than 8 characters', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'short',
    }
    const result = createUserSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })

  it('should reject password longer than 128 characters', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'a'.repeat(129),
    }
    const result = createUserSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })

  it('should validate all required fields', () => {
    const invalidData = {}
    const result = createUserSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(4)
    }
  })
})
