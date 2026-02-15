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

    // Get initial balance text
    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion).toBeVisible({ timeout: 10000 })

    // Create a credit transaction via quick action
    await page.getByRole('button', { name: /add credit/i }).click()

    // Wait for modal
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill amount
    await page.getByRole('dialog').getByLabel(/amount/i).fill('100.00')

    // Submit
    await page.getByRole('dialog').getByRole('button', { name: /create transaction/i }).click()

    // Wait for modal to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

    // Wait for balance to update
    await page.waitForTimeout(1000)

    // Balance should now show $100.00
    await expect(balanceRegion.getByText(/\$\s*100\.00/i)).toBeVisible()
  })

  test('should update balance after debit transaction', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // First add some credit
    await page.getByRole('button', { name: /add credit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByLabel(/amount/i).fill('200.00')
    await page.getByRole('dialog').getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Verify balance is $200.00
    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion.getByText(/\$\s*200\.00/i)).toBeVisible()

    // Now add a debit
    await page.getByRole('button', { name: /add debit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByLabel(/amount/i).fill('50.00')
    await page.getByRole('dialog').getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Balance should now show $150.00
    await expect(balanceRegion.getByText(/\$\s*150\.00/i)).toBeVisible()
  })

  test('should show correct balance after multiple transactions', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion).toBeVisible({ timeout: 10000 })

    // Add credit: $300
    await page.getByRole('button', { name: /add credit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByLabel(/amount/i).fill('300.00')
    await page.getByRole('dialog').getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Add debit: $75
    await page.getByRole('button', { name: /add debit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByLabel(/amount/i).fill('75.00')
    await page.getByRole('dialog').getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Add credit: $50
    await page.getByRole('button', { name: /add credit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByLabel(/amount/i).fill('50.00')
    await page.getByRole('dialog').getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(1000)

    // Balance should be $300 - $75 + $50 = $275.00
    await expect(balanceRegion.getByText(/\$\s*275\.00/i)).toBeVisible()
  })

  test('should persist balance after page reload', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Add credit
    await page.getByRole('button', { name: /add credit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByLabel(/amount/i).fill('500.00')
    await page.getByRole('dialog').getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
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

  test('should show balance on dashboard after navigating from transactions', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Go to transactions page using exact link name
    await page.getByRole('link', { name: 'Transactions', exact: true }).click()
    await expect(page).toHaveURL('/transactions')

    // Create a transaction
    const form = page.locator('form[aria-label*="New Transaction"], form[aria-label*="new transaction"]')
    await form.getByRole('button', { name: /credit/i }).click()
    await form.getByLabel(/amount/i).fill('123.45')
    await form.getByRole('button', { name: /create transaction/i }).click()
    await expect(page.getByText(/transaction created successfully/i)).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)

    // Navigate back to dashboard using exact link name
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
    await expect(page).toHaveURL('/dashboard')

    // Wait for balance to load
    await page.waitForTimeout(1000)

    // Balance should reflect the transaction
    const balanceRegion = page.getByRole('region', { name: /current balance/i })
    await expect(balanceRegion.getByText(/\$\s*123\.45/i)).toBeVisible()
  })
})
