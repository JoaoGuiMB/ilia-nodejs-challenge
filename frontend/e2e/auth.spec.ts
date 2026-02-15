import { test, expect } from "./fixtures";

test.describe("User Registration", () => {
  test("should register a new user successfully", async ({
    page,
    testUser,
  }) => {
    await page.goto("/register");

    // Fill registration form
    await page.getByLabel(/first name/i).fill(testUser.firstName);
    await page.getByLabel(/last name/i).fill(testUser.lastName);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);

    // Submit form
    await page.getByRole("button", { name: /create account/i }).click();

    // Verify redirect to login page
    await expect(page).toHaveURL("/login");
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/register");

    // Try to submit empty form
    await page.getByRole("button", { name: /create account/i }).click();

    // Should stay on register page
    await expect(page).toHaveURL("/register");
  });

  test("should show validation error for invalid email", async ({
    page,
    testUser,
  }) => {
    await page.goto("/register");

    // Fill form with invalid email
    await page.getByLabel(/first name/i).fill(testUser.firstName);
    await page.getByLabel(/last name/i).fill(testUser.lastName);
    await page.getByLabel(/email/i).fill("invalid-email");
    await page.getByLabel(/password/i).fill(testUser.password);

    // Submit form
    await page.getByRole("button", { name: /create account/i }).click();

    // Should stay on register page
    await expect(page).toHaveURL("/register");
  });

  test("should show validation error for short password", async ({
    page,
    testUser,
  }) => {
    await page.goto("/register");

    // Fill form with short password
    await page.getByLabel(/first name/i).fill(testUser.firstName);
    await page.getByLabel(/last name/i).fill(testUser.lastName);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill("short");

    // Submit form
    await page.getByRole("button", { name: /create account/i }).click();

    // Should stay on register page
    await expect(page).toHaveURL("/register");
  });

  test("should navigate to login page via link", async ({ page }) => {
    await page.goto("/register");

    // Click sign in link
    await page.getByRole("link", { name: /sign in/i }).click();

    // Should navigate to login
    await expect(page).toHaveURL("/login");
  });
});

test.describe("User Login", () => {
  test("should login with valid credentials", async ({ page, testUser }) => {
    // First register the user
    await page.goto("/register");
    await page.getByLabel(/first name/i).fill(testUser.firstName);
    await page.getByLabel(/last name/i).fill(testUser.lastName);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page).toHaveURL("/login", { timeout: 10000 });

    // Wait for login page to be fully loaded
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

    // Now login
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Verify redirect to transactions page
    await expect(page).toHaveURL("/transactions", { timeout: 10000 });

    // Verify transactions page is displayed
    await expect(
      page.getByRole("heading", { name: /transactions/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Try to login with invalid credentials
    await page.getByLabel(/email/i).fill("nonexistent@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByRole("alert")).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL("/login");
  });

  test("should show error for wrong password", async ({ page, testUser }) => {
    // First register the user
    await page.goto("/register");
    await page.getByLabel(/first name/i).fill(testUser.firstName);
    await page.getByLabel(/last name/i).fill(testUser.lastName);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page).toHaveURL("/login", { timeout: 10000 });

    // Wait for login page to be fully loaded
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

    // Try to login with wrong password
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error message (wait for API response)
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });

    // Should stay on login page
    await expect(page).toHaveURL("/login");
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should stay on login page
    await expect(page).toHaveURL("/login");
  });

  test("should navigate to register page via link", async ({ page }) => {
    await page.goto("/login");

    // Click create account link
    await page.getByRole("link", { name: /create one/i }).click();

    // Should navigate to register
    await expect(page).toHaveURL("/register");
  });
});

test.describe("User Logout", () => {
  test("should logout and redirect to login page", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Click logout button
    await page
      .getByRole("button", { name: /sign out/i })
      .first()
      .click();

    // Should redirect to login page
    await expect(page).toHaveURL("/login");
  });

  test("should not access protected routes after logout", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Click logout button
    await page
      .getByRole("button", { name: /sign out/i })
      .first()
      .click();

    // Wait for redirect to login
    await expect(page).toHaveURL("/login");

    // Try to access transactions
    await page.goto("/transactions");

    // Should be redirected to login
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Protected Routes", () => {
  test("should redirect to login when accessing transactions without auth", async ({
    page,
  }) => {
    await page.goto("/transactions");

    // Should be redirected to login
    await expect(page).toHaveURL("/login");
  });
});
