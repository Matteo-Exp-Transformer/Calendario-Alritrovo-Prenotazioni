import { test, expect } from '@playwright/test';

test('dietary padding comparison screenshot', async ({ page }) => {
  // Navigate to booking page
  await page.goto('http://localhost:5175/prenota');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Select "Rinfresco di Laurea" booking type using the select element
  await page.selectOption('#booking_type', 'rinfresco_laurea');

  // Wait a moment for menu cards to appear
  await page.waitForTimeout(1000);

  // Scroll to the dietary restrictions section
  await page.locator('text=Intolleranze e Richieste Speciali').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Add first dietary restriction: No Lattosio, 2 guests
  const restrictionSelect = page.locator('select').filter({ hasText: 'No Lattosio' }).first();
  await restrictionSelect.selectOption('No Lattosio');

  const guestCountInput = page.locator('input[type="number"]').filter({ hasText: '' }).first();
  await guestCountInput.fill('2');

  await page.click('button:has-text("Aggiungi")');
  await page.waitForTimeout(500);

  // Add second dietary restriction: No Glutine, 1 guest
  await restrictionSelect.selectOption('No Glutine');
  await guestCountInput.fill('1');
  await page.click('button:has-text("Aggiungi")');
  await page.waitForTimeout(500);

  // Add third dietary restriction: Vegano, 3 guests
  await restrictionSelect.selectOption('Vegano');
  await guestCountInput.fill('3');
  await page.click('button:has-text("Aggiungi")');
  await page.waitForTimeout(500);

  // Wait for all dietary restrictions to be added to the list
  await page.waitForSelector('text=Intolleranze inserite:', { timeout: 2000 });
  await page.waitForTimeout(500);

  // Scroll to show the added dietary restrictions cards
  await page.locator('text=Intolleranze inserite:').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Scroll up to show both menu cards and dietary restriction cards together
  await page.evaluate(() => window.scrollBy(0, -400));
  await page.waitForTimeout(500);

  // Take screenshot showing the comparison
  await page.screenshot({
    path: 'e2e/screenshots/dietary-padding-AFTER-fix.png',
    fullPage: false
  });

  console.log('Screenshot saved to: e2e/screenshots/dietary-padding-AFTER-fix.png');
});
