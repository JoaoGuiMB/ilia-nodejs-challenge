import { test, expect } from './fixtures'

test.describe('Balance Display', () => {
  test('should display initial balance of zero', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Wait for balance card to be visible
    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion).toBeVisible({ timeout: 10000 })

    // Initial balance should be 0 for new user
    await expect(balanceRegion.getByText(/\$\s*0\.00/i)).toBeVisible()
  })

  test('should update balance after credit transaction', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Get balance region
    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion).toBeVisible({ timeout: 10000 })

    // Create a credit transaction using the form on transactions page
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('100.00')
    await form.getByRole('button', { name: /create transaction/i }).click()

    // Wait for success message
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Balance should now show $100.00
    await expect(balanceRegion.getByText(/\$\s*100\.00/i)).toBeVisible()
  })

  test('should update balance after debit transaction', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // First add some credit
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('200.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Verify balance is $200.00
    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion.getByText(/\$\s*200\.00/i)).toBeVisible()

    // Clear the amount field first
    await form.getByLabel(/amount/i).clear()

    // Now add a debit
    await form.getByRole('button', { name: /debit/i }).click()
    await form.getByLabel(/amount/i).fill('50.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Balance should now show $150.00
    await expect(balanceRegion.getByText(/\$\s*150\.00/i)).toBeVisible()
  })

  test('should show correct balance after multiple transactions', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion).toBeVisible({ timeout: 10000 })

    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')

    // Add credit: $300
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('300.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Clear and add debit: $75
    await form.getByLabel(/amount/i).clear()
    await form.getByRole('button', { name: /debit/i }).click()
    await form.getByLabel(/amount/i).fill('75.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Clear and add credit: $50
    await form.getByLabel(/amount/i).clear()
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('50.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Balance should be $300 - $75 + $50 = $275.00
    await expect(balanceRegion.getByText(/\$\s*275\.00/i)).toBeVisible()
  })

  test('should persist balance after page reload', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Add credit
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('500.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Verify balance
    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion.getByText(/\$\s*500\.00/i)).toBeVisible()

    // Reload page
    await page.reload()

    // Wait for balance to load
    await expect(balanceRegion).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Balance should still be $500.00
    await expect(balanceRegion.getByText(/\$\s*500\.00/i)).toBeVisible()
  })
})

test.describe('Transaction Creation', () => {
  test('should create credit transaction successfully', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Create a credit transaction using the form on transactions page
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('123.45')
    await form.getByRole('button', { name: /create transaction/i }).click()

    // Wait for success message
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })

    // Transaction should appear in the list (use +$ prefix to distinguish from balance)
    await expect(page.getByText('+$123.45')).toBeVisible()
  })

  test('should create debit transaction successfully', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // First create a credit to have funds
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('200.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })

    // Clear and create a debit transaction
    await form.getByLabel(/amount/i).clear()
    await form.getByRole('button', { name: /debit/i }).click()
    await form.getByLabel(/amount/i).fill('50.00')
    await form.getByRole('button', { name: /create transaction/i }).click()

    // Wait for success message
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })

    // Transaction should appear in the list (use -$ prefix to distinguish from balance)
    await expect(page.getByText('-$50.00')).toBeVisible()
  })
})
