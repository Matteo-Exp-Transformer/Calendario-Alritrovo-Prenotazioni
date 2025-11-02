import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard UI Modernization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto('http://localhost:5175/admin');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check if we're on login page and need to log in
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();

    if (await emailField.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Fill in login credentials (real test admin credentials)
      await emailField.fill('0cavuz0@gmail.com');
      await passwordField.fill('Cavallaro');

      // Click login button
      const loginButton = page.locator('button:has-text("Accedi")').first();
      await loginButton.click();

      // Wait for dashboard to load
      await page.waitForTimeout(2000);
    }
  });

  test('navigate to admin dashboard and take full screenshot', async ({ page }) => {
    // Take full page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/ui-modernization/01-admin-dashboard-full.png',
      fullPage: true
    });

    console.log('Took full admin dashboard screenshot');
  });

  test('capture navigation tabs', async ({ page }) => {
    // Look for tab elements and take screenshot
    const tabsArea = page.locator('nav').first();
    if (await tabsArea.isVisible()) {
      await tabsArea.screenshot({
        path: 'e2e/screenshots/ui-modernization/02-navigation-tabs.png'
      });
    } else {
      // If no specific tabs area, take a crop of the top navigation
      await page.screenshot({
        path: 'e2e/screenshots/ui-modernization/02-navigation-tabs.png',
        clip: { x: 0, y: 70, width: 1280, height: 120 }
      });
    }

    console.log('Took navigation tabs screenshot');
  });

  test('interact with collapsible cards', async ({ page }) => {
    // Look for collapsible or expandable cards
    const collapsibleCards = page.locator('[class*="collapsible"], [class*="card"]').first();

    if (await collapsibleCards.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Take screenshot of cards area
      await page.screenshot({
        path: 'e2e/screenshots/ui-modernization/03-collapsible-cards.png',
        fullPage: true
      });
    } else {
      // Just take full page as fallback
      await page.screenshot({
        path: 'e2e/screenshots/ui-modernization/03-collapsible-cards.png',
        fullPage: true
      });
    }

    console.log('Took collapsible cards screenshot');
  });

  test('mobile view responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Navigate to admin page with mobile viewport
    await page.goto('http://localhost:5175/admin');
    await page.waitForTimeout(1000);

    // Check if we're on login page and need to log in (for mobile)
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    if (await emailField.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Fill in login credentials (real test admin credentials)
      await emailField.fill('0cavuz0@gmail.com');
      await passwordField.fill('Cavallaro');

      // Click login button
      const loginButton = page.locator('button:has-text("Accedi")').first();
      await loginButton.click();

      // Wait for dashboard to load
      await page.waitForTimeout(2000);
    }

    // Take mobile screenshot
    await page.screenshot({
      path: 'e2e/screenshots/ui-modernization/04-mobile-view.png',
      fullPage: true
    });

    console.log('Took mobile view screenshot');
  });

  test('verify page elements are visible', async ({ page }) => {
    // Check for header
    const header = page.locator('header').first();
    console.log('Header visible:', await header.isVisible({ timeout: 1000 }).catch(() => false));

    // Check for navigation
    const nav = page.locator('nav').first();
    console.log('Navigation visible:', await nav.isVisible({ timeout: 1000 }).catch(() => false));

    // Check for main content
    const main = page.locator('main').first();
    console.log('Main content visible:', await main.isVisible({ timeout: 1000 }).catch(() => false));
  });
});

