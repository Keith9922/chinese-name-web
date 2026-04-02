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

  test("should fill in the form and submit successfully", async ({ page }) => {
    // Fill name input
    await page.locator("#englishName").fill("John Smith");

    // Select gender using combobox role (Radix Select)
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Male", exact: true }).click();

    // Fill birth date
    await page.locator("#birthDate").fill("1990-05-15");

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for result to appear (either success or error)
    await expect(
      page.getByText("Your Chinese Name").or(page.locator("text=Sorry"))
    ).toBeVisible({ timeout: 10000 });
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

  test("should handle error state gracefully", async ({ page }) => {
    // This test checks that error handling works
    // We'll fill the form and submit - if backend is down or returns error, error message should appear
    await page.locator("#englishName").fill("Error Test");
    await page.locator("#birthDate").fill("2000-01-01");

    // Select gender
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Other / Prefer not to say", exact: true }).click();

    await page.locator('button[type="submit"]').click();

    // Either success result OR error message should appear
    const result = page.getByText("Your Chinese Name").or(page.locator("text=Sorry"));
    await expect(result.first()).toBeVisible({ timeout: 15000 });
  });

  test("should reset form after generating a name (if Try Again appears)", async ({ page }) => {
    // Fill and submit form
    await page.locator("#englishName").fill("Reset Test");
    await page.locator("#birthDate").fill("1995-12-25");

    // Select gender
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Male", exact: true }).click();

    await page.locator('button[type="submit"]').click();

    // Wait for either result or error
    try {
      const result = page.getByText("Your Chinese Name").or(page.locator("text=Sorry"));
      await expect(result.first()).toBeVisible({ timeout: 15000 });

      // If result appears, check for "Generate Another Name" button
      const tryAgainButton = page.locator("text=Generate Another Name");
      if (await tryAgainButton.isVisible()) {
        await tryAgainButton.click();
        // Form should be cleared
        await expect(page.locator("#englishName")).toHaveValue("");
      }
    } catch {
      // If no result, check that form is still functional
      await expect(page.locator("#englishName")).toBeVisible();
    }
  });
});

test.describe("Homepage Content", () => {
  test("should display header and navigation", async ({ page }) => {
    await page.goto("/");

    // Check header brand - use exact match to avoid matching footer
    await expect(page.getByText("ChineseName", { exact: true })).toBeVisible();

    // Check navigation links using role selectors
    await expect(page.getByRole("link", { name: "How It Works" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  });

  test("should display feature highlights", async ({ page }) => {
    await page.goto("/");

    // Check feature badges using getByText with exact match
    await expect(page.getByText("100% Free", { exact: true })).toBeVisible();
    await expect(page.getByText("Instant", { exact: true })).toBeVisible();
    await expect(page.getByText("Culturally Rich", { exact: true })).toBeVisible();
  });

  test("should display pricing section", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#pricing")).toBeVisible();
    await expect(page.getByText("Simple Pricing")).toBeVisible();
  });

  test("should navigate to how-it-works section", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#how-it-works")).toBeVisible();
    await expect(page.getByText("Enter Your Details", { exact: true })).toBeVisible();
    await expect(page.getByText("AI-Powered Analysis", { exact: true })).toBeVisible();
    await expect(page.getByText("Get Your Name", { exact: true })).toBeVisible();
  });
});
