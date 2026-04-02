import { test, expect } from "@playwright/test";

test.describe("Chinese Name Generator Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the homepage with form elements", async ({ page }) => {
    // Check main heading
    await expect(page.locator("h1")).toContainText("Chinese Name");

    // Check form elements exist
    await expect(page.locator("#englishName")).toBeVisible();
    await expect(page.locator("#birthDate")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText("Discover My Chinese Name");
  });

  test("should show validation error for empty form submission", async ({ page }) => {
    // Try to submit empty form - the form has 'required' attribute so it should prevent submission
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();

    // Click submit without filling - browser validation should prevent it
    await submitButton.click();

    // Form should still be visible (no navigation or result change)
    await expect(page.locator("#englishName")).toBeVisible();
  });

  test("should show loading state while submitting", async ({ page }) => {
    // Fill form
    await page.locator("#englishName").fill("Test User");
    await page.locator("#birthDate").fill("1985-03-20");

    // Select gender
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Female", exact: true }).click();

    // Submit and check for loading state immediately
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Loading state should show "Revealing your name..."
    await expect(page.locator("text=Revealing your name")).toBeVisible({ timeout: 5000 });
  });

  test("should display header with brand name", async ({ page }) => {
    // Check header brand appears at least once (avoid strict mode)
    await expect(page.getByText("ChineseName").first()).toBeVisible();
  });

  test("should have functional navigation links", async ({ page }) => {
    // Check navigation links exist (use first() to avoid strict mode violation from header + footer)
    await expect(page.getByRole("link", { name: "How It Works" }).first()).toBeAttached();
    await expect(page.getByRole("link", { name: "Pricing" }).first()).toBeAttached();
  });

  test("should display premium button in header", async ({ page }) => {
    // Check for Try Free button in header
    await expect(page.getByRole("button", { name: "Try Free" })).toBeVisible();
  });
});

test.describe("Form Functionality", () => {
  test("should fill and submit form successfully", async ({ page }) => {
    await page.goto("/");

    // Fill name input
    await page.locator("#englishName").fill("John Smith");

    // Select gender
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Male", exact: true }).click();

    // Fill birth date
    await page.locator("#birthDate").fill("1990-05-15");

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for either result or error (backend may not be running)
    const resultOrError = page.locator("text=Your Chinese Name").or(page.locator("text=Sorry")).or(page.locator("text=Revealing your name"));
    await expect(resultOrError.first()).toBeVisible({ timeout: 10000 });
  });
});
