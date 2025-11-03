import { test, expect } from '@playwright/test';

test('dietary restrictions layout debug screenshot', async ({ page }) => {
  // Navigate to the booking page
  await page.goto('http://localhost:5175/prenota');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Scroll to the dietary restrictions section
  const dietarySection = page.locator('text=Intolleranze e Richieste Speciali').first();
  await dietarySection.scrollIntoViewIfNeeded();

  // Wait a bit for any animations
  await page.waitForTimeout(500);

  // Find the textarea for dietary restrictions
  const textarea = page.locator('textarea[placeholder*="lattosio"], textarea[placeholder*="intolleranze"]').first();

  // Add multiple dietary restrictions
  await textarea.fill('No Lattosio\nNo Glutine\nVegano');

  // Wait for the UI to update
  await page.waitForTimeout(500);

  // Scroll to show both dietary restrictions and menu section
  // Try to position so we can see the dietary cards and menu cards together
  await page.evaluate(() => {
    const dietaryHeading = document.querySelector('h3, h2')?.parentElement;
    if (dietaryHeading) {
      const yOffset = dietaryHeading.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
  });

  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({
    path: 'e2e/screenshots/dietary-restrictions-layout-debug.png',
    fullPage: false
  });

  console.log('Screenshot saved to e2e/screenshots/dietary-restrictions-layout-debug.png');
});
