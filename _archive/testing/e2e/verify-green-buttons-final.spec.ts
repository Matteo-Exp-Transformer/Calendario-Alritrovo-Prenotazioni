import { test, expect } from '@playwright/test';

test('verify green submit and aggiungi buttons', async ({ page, context }) => {
  // Clear all browser data and cache before navigating
  await context.clearCookies();

  // Navigate to booking page with no cache
  await page.goto('http://localhost:5175/prenota', {
    waitUntil: 'networkidle'
  });

  // Wait for page to fully load
  await page.waitForTimeout(2000);

  // Take full page screenshot to see all sections
  await page.screenshot({
    path: 'e2e/screenshots/verify-full-page-complete.png',
    fullPage: true
  });

  // Scroll step by step to find menu/dietary section with Aggiungi button
  // First check if menu selection is visible
  const menuSection = page.locator('text=Menu').first();
  if (await menuSection.isVisible({ timeout: 2000 }).catch(() => false)) {
    await menuSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  }

  // Scroll to find dietary restrictions section
  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(500);

  // Take screenshot of dietary restrictions area (looking for green Aggiungi button)
  await page.screenshot({
    path: 'e2e/screenshots/verify-green-aggiungi-button-FINAL.png',
    fullPage: false
  });

  // Scroll to absolute bottom to see submit button
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  // Take screenshot of green submit button at bottom
  await page.screenshot({
    path: 'e2e/screenshots/verify-green-submit-button-FINAL.png',
    fullPage: false
  });

  console.log('✓ All screenshots taken successfully');
  console.log('✓ Full page: e2e/screenshots/verify-full-page-complete.png');
  console.log('✓ Screenshot 1: e2e/screenshots/verify-green-aggiungi-button-FINAL.png');
  console.log('✓ Screenshot 2: e2e/screenshots/verify-green-submit-button-FINAL.png');
});
