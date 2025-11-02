import { test, expect } from '@playwright/test';

/**
 * Test Suite: Logout Button Verification
 * Purpose: Verify there's only ONE logout button and it works correctly
 * - Check that there's only one logout button visible
 * - Verify logout button is in AdminHeader (not in main dashboard area)
 * - Test that clicking logout redirects to login page
 */

test.describe('Logout Button - Single Button Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Login with credentials
    await page.fill('#email', process.env.ADMIN_EMAIL || '0cavuz0@gmail.com');
    await page.fill('#password', process.env.ADMIN_PASSWORD || 'Cavallaro');
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i });
    await submitButton.click();

    // Wait for dashboard to load
    await page.waitForURL('**/admin');
    await page.waitForLoadState('networkidle');
  });

  test('TC1: Only ONE logout button should be visible', async ({ page }) => {
    // Find all logout buttons (by text "LOGOUT" or "Logout")
    const logoutButtons = page.locator('button:has-text("Logout"), button:has-text("LOGOUT")');
    const count = await logoutButtons.count();

    // Take screenshot showing the header area
    await page.screenshot({
      path: 'screenshots/logout-button-verification.png',
      fullPage: true
    });

    console.log(`Found ${count} logout button(s)`);

    // Should have exactly ONE logout button
    expect(count).toBe(1);
    console.log('✅ Only one logout button found');
  });

  test('TC2: Logout button should be in the top-right area (AdminHeader)', async ({ page }) => {
    // Find the logout button
    const logoutButton = page.locator('button:has-text("Logout")').first();

    // Get button position
    const boundingBox = await logoutButton.boundingBox();

    if (!boundingBox) {
      throw new Error('Logout button not found or not visible');
    }

    // Logout button should be in the upper portion of the page (y < 150px typically for header)
    expect(boundingBox.y).toBeLessThan(200);
    console.log(`✅ Logout button is in header area (y: ${boundingBox.y}px)`);

    // Button should be towards the right side of the page
    const viewportSize = page.viewportSize();
    if (viewportSize) {
      // Should be in the right half of the screen
      expect(boundingBox.x).toBeGreaterThan(viewportSize.width / 3);
      console.log(`✅ Logout button is positioned on the right side (x: ${boundingBox.x}px)`);
    }
  });

  test('TC3: Logout button should work and redirect to login page', async ({ page }) => {
    // Find and click the logout button
    const logoutButton = page.locator('button:has-text("Logout")').first();

    // Take screenshot before logout
    await page.screenshot({
      path: 'screenshots/before-logout.png',
      fullPage: true
    });

    // Click logout
    await logoutButton.click();

    // Wait for navigation to login page
    await page.waitForURL('**/login', { timeout: 5000 });

    // Verify we're on the login page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
    console.log('✅ Successfully redirected to login page after logout');

    // Verify login form is visible
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    console.log('✅ Login form is visible after logout');

    // Take screenshot after logout
    await page.screenshot({
      path: 'screenshots/after-logout.png',
      fullPage: true
    });
  });

  test('TC4: Verify no logout button below "Dashboard Amministratore" text', async ({ page }) => {
    // Get the "Dashboard Amministratore" text element
    const dashboardText = page.locator('text=Dashboard Amministratore');
    await expect(dashboardText).toBeVisible();

    // Get position of dashboard text
    const textBox = await dashboardText.boundingBox();

    if (!textBox) {
      throw new Error('Dashboard text not found');
    }

    // Find all logout buttons
    const logoutButtons = page.locator('button:has-text("Logout")');
    const count = await logoutButtons.count();

    // Check position of each logout button
    for (let i = 0; i < count; i++) {
      const button = logoutButtons.nth(i);
      const buttonBox = await button.boundingBox();

      if (buttonBox) {
        // Button should NOT be directly below the text (y position shouldn't be close to text bottom)
        const isDirectlyBelow = buttonBox.y > textBox.y && buttonBox.y < textBox.y + 100;
        const isAligned = Math.abs(buttonBox.x - textBox.x) < 50;

        if (isDirectlyBelow && isAligned) {
          throw new Error(`Found logout button below "Dashboard Amministratore" at position (${buttonBox.x}, ${buttonBox.y})`);
        }
      }
    }

    console.log('✅ No logout button found below "Dashboard Amministratore" text');
  });

  test('TC5: Visual check - logout button styling matches AdminHeader', async ({ page }) => {
    // Find the logout button
    const logoutButton = page.locator('button:has-text("Logout")').first();

    // Check button has the expected styling classes from AdminHeader
    const buttonClass = await logoutButton.getAttribute('class');

    // Should have bg-white styling (from AdminHeader component)
    expect(buttonClass).toContain('bg-white');

    // Should have rounded-modern styling
    expect(buttonClass).toContain('rounded-modern');

    // Should have border styling
    expect(buttonClass).toContain('border');

    console.log('✅ Logout button has correct AdminHeader styling');

    // Take detailed screenshot of logout button area
    await logoutButton.screenshot({ path: 'screenshots/logout-button-detail.png' });
  });
});
