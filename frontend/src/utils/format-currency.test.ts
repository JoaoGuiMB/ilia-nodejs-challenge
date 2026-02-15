import { describe, it, expect } from 'vitest'
import { formatCurrency } from './format-currency'

describe('formatCurrency', () => {
  it('should format positive numbers with 2 decimal places', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('should format whole numbers with 2 decimal places', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('should format negative numbers', () => {
    expect(formatCurrency(-500.5)).toBe('-$500.50')
  })

  it('should format large numbers with commas', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
  })

  it('should format small decimal numbers', () => {
    expect(formatCurrency(0.01)).toBe('$0.01')
  })

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00')
    expect(formatCurrency(10.994)).toBe('$10.99')
  })
})
