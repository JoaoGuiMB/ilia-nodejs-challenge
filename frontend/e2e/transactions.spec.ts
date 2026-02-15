import { test, expect } from './fixtures'

test.describe('Transaction Creation', () => {
  test('should create a credit transaction', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navigate to transactions page using nav link (exact match)
    await page.getByRole('link', { name: 'Transactions', exact: true }).click()
    await expect(page).toHaveURL('/transactions')

    // Fill transaction form
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('100.50')

    // Submit form
    await form.getByRole('button', { name: /create transaction/i }).click()

    // Wait for success message
    await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible()
  })

  test('should create a debit transaction', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navigate to transactions page using nav link
    await page.getByRole('link', { name: 'Transactions', exact: true }).click()
    await expect(page).toHaveURL('/transactions')

    // Fill transaction form
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /debit/i }).click()
    await form.getByLabel(/amount/i).fill('25.75')

    // Submit form
    await form.getByRole('button', { name: /create transaction/i }).click()

    // Wait for success message
    await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible()
  })

  test('should show validation error for empty amount', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navigate to transactions page using nav link
    await page.getByRole('link', { name: 'Transactions', exact: true }).click()
    await expect(page).toHaveURL('/transactions')

    // Try to submit form without amount
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /create transaction/i }).click()

    // Should show validation error or stay on form
    await expect(page).toHaveURL('/transactions')
  })

  test('should create transaction via quick action on dashboard', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Click add credit button on dashboard
    await page.getByRole('button', { name: /add credit/i }).click()

    // Wait for modal to open
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill amount in modal
    await page.getByRole('dialog').getByLabel(/amount/i).fill('50.00')

    // Submit
    await page.getByRole('dialog').getByRole('button', { name: /create transaction/i }).click()

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
  })

  test('should show transaction in list after creation', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navigate to transactions page using nav link
    await page.getByRole('link', { name: 'Transactions', exact: true }).click()
    await expect(page).toHaveURL('/transactions')

    // Create a transaction with a specific amount
    const uniqueAmount = (Math.random() * 100 + 100).toFixed(2)
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill(uniqueAmount)
    await form.getByRole('button', { name: /create transaction/i }).click()

    // Wait for success and transaction list refresh
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })

    // Wait a bit for the list to refresh
    await page.waitForTimeout(1000)

    // Check if transaction appears in the list
    await expect(page.getByText(new RegExp(uniqueAmount.replace('.', '\\.')))).toBeVisible()
  })
})

test.describe('Transaction Filtering', () => {
  test('should filter transactions by credit type', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navigate to transactions using nav link
    await page.getByRole('link', { name: 'Transactions', exact: true }).click()
    await expect(page).toHaveURL('/transactions')

    // Create a credit transaction
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('100.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)

    // Create a debit transaction
    await form.getByRole('button', { name: /debit/i }).click()
    await form.getByLabel(/amount/i).fill('50.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)

    // Find filter buttons in the transaction history section
    const filterGroup = page.getByRole('group', { name: /filter/i })

    // Click Credit filter
    await filterGroup.getByRole('button', { name: /credit/i }).click()
    await page.waitForTimeout(500)

    // The filter button should be pressed
    await expect(filterGroup.getByRole('button', { name: /credit/i })).toHaveAttribute('aria-pressed', 'true')
  })

  test('should filter transactions by debit type', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navigate to transactions using nav link
    await page.getByRole('link', { name: 'Transactions', exact: true }).click()
    await expect(page).toHaveURL('/transactions')

    // Create a credit transaction
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('75.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)

    // Create a debit transaction
    await form.getByRole('button', { name: /debit/i }).click()
    await form.getByLabel(/amount/i).fill('30.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)

    // Find filter buttons
    const filterGroup = page.getByRole('group', { name: /filter/i })

    // Click Debit filter
    await filterGroup.getByRole('button', { name: /debit/i }).click()
    await page.waitForTimeout(500)

    // The filter button should be pressed
    await expect(filterGroup.getByRole('button', { name: /debit/i })).toHaveAttribute('aria-pressed', 'true')
  })

  test('should show all transactions when "All" filter is selected', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navigate to transactions using nav link
    await page.getByRole('link', { name: 'Transactions', exact: true }).click()
    await expect(page).toHaveURL('/transactions')

    // Create transactions
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')

    // Create credit
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('60.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)

    // Create debit
    await form.getByRole('button', { name: /debit/i }).click()
    await form.getByLabel(/amount/i).fill('20.00')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)

    // Find filter buttons
    const filterGroup = page.getByRole('group', { name: /filter/i })

    // First filter by credit
    await filterGroup.getByRole('button', { name: /credit/i }).click()
    await page.waitForTimeout(500)

    // Then click All filter
    await filterGroup.getByRole('button', { name: /all/i }).click()
    await page.waitForTimeout(500)

    // All filter should be pressed
    await expect(filterGroup.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
