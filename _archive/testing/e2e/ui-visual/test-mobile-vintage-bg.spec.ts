import { test, expect } from '@playwright/test';

test.describe('Mobile Vintage Background Verification', () => {
  test('should verify desktop layout unchanged', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to booking form
    await page.goto('http://localhost:5175/prenota');

    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });

    // Take full page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/mobile-bg-desktop.png',
      fullPage: true
    });

    console.log('✅ Desktop screenshot saved: e2e/screenshots/mobile-bg-desktop.png');
  });

  test('should verify mobile transparent card - top', async ({ page }) => {
    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to booking form
    await page.goto('http://localhost:5175/prenota');

    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });

    // Take screenshot of top
    await page.screenshot({
      path: 'e2e/screenshots/mobile-bg-top.png',
      fullPage: false
    });

    console.log('✅ Mobile top screenshot saved: e2e/screenshots/mobile-bg-top.png');
  });

  test('should verify mobile vintage background - bottom', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to booking form
    await page.goto('http://localhost:5175/prenota');

    // Wait for page to load
    await page.waitForSelector('form', { timeout: 10000 });

    // Scroll to bottom to see vintage image
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait a bit for scroll
    await page.waitForTimeout(1000);

    // Take screenshot after scroll
    await page.screenshot({
      path: 'e2e/screenshots/mobile-bg-bottom.png',
      fullPage: false
    });

    console.log('✅ Mobile bottom screenshot saved: e2e/screenshots/mobile-bg-bottom.png');
  });

  test('should verify mobile full page', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to booking form
    await page.goto('http://localhost:5175/prenota');

    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });

    // Take full page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/mobile-bg-full.png',
      fullPage: true
    });

    console.log('✅ Mobile full page screenshot saved: e2e/screenshots/mobile-bg-full.png');
  });
});
