import { test, expect } from '@playwright/test';

test.describe('Visual Test - Mobile Background', () => {

  test('Desktop view - card opaca, no vintage image', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to prenota page
    await page.goto('http://localhost:5175/prenota');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow for any animations

    // Take full-page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/mobile-bg-desktop.png',
      fullPage: true
    });

    console.log('✓ Desktop screenshot saved: e2e/screenshots/mobile-bg-desktop.png');
  });

  test('Mobile view - top section', async ({ page }) => {
    // iPhone SE viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to prenota page
    await page.goto('http://localhost:5175/prenota');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Screenshot of top section (no scroll)
    await page.screenshot({
      path: 'e2e/screenshots/mobile-bg-top.png'
    });

    console.log('✓ Mobile top screenshot saved: e2e/screenshots/mobile-bg-top.png');
  });

  test('Mobile view - bottom section with scroll', async ({ page }) => {
    // iPhone SE viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to prenota page
    await page.goto('http://localhost:5175/prenota');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Scroll to bottom to see "Orari e Contatti" and vintage image
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for scroll to complete
    await page.waitForTimeout(500);

    // Screenshot after scroll
    await page.screenshot({
      path: 'e2e/screenshots/mobile-bg-bottom.png'
    });

    console.log('✓ Mobile bottom screenshot saved: e2e/screenshots/mobile-bg-bottom.png');
  });

  test('Mobile view - full page', async ({ page }) => {
    // iPhone SE viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to prenota page
    await page.goto('http://localhost:5175/prenota');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take full-page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/mobile-bg-full.png',
      fullPage: true
    });

    console.log('✓ Mobile full-page screenshot saved: e2e/screenshots/mobile-bg-full.png');
  });
});
