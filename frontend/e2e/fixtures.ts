import { test as base, expect, type Page } from '@playwright/test'

interface TestUser {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface TestFixtures {
  testUser: TestUser
  authenticatedPage: Page
}

function generateUniqueEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `test-${timestamp}-${random}@example.com`
}

async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register')
  await page.getByLabel(/first name/i).fill(user.firstName)
  await page.getByLabel(/last name/i).fill(user.lastName)
  await page.getByLabel(/email/i).fill(user.email)
  await page.getByLabel(/password/i).fill(user.password)
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page).toHaveURL('/login', { timeout: 10000 })
}

async function loginUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(user.email)
  await page.getByLabel(/password/i).fill(user.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
}

export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    const user: TestUser = {
      email: generateUniqueEmail(),
      password: 'Test@1234',
      firstName: 'Test',
      lastName: 'User',
    }
    await use(user)
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // Register the test user
    await registerUser(page, testUser)
    // Login the test user
    await loginUser(page, testUser)
    // Wait for dashboard to load - look for the welcome heading
    await expect(
      page.getByRole('heading', { name: /welcome back/i })
    ).toBeVisible({ timeout: 10000 })
    await use(page)
  },
})

export { expect }
export type { TestUser }
