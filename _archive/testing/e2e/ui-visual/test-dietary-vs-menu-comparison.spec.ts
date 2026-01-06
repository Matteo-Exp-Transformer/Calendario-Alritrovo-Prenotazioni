import { test, expect } from '@playwright/test';

test('compare dietary restrictions cards with menu cards', async ({ page }) => {
  // Navigate to booking page
  await page.goto('http://localhost:5175/prenota');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Select "Rinfresco di Laurea" booking type
  await page.selectOption('#booking_type', 'rinfresco_laurea');

  // Wait for menu and dietary sections to appear
  await page.waitForSelector('text=Menù', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('text=Intolleranze e Richieste Speciali', { state: 'visible' });

  // Scroll down to the dietary restrictions section
  const dietarySection = page.locator('text=Intolleranze e Richieste Speciali');
  await dietarySection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Find the dietary restriction select (within the DietaryRestrictionsSection)
  const dietarySelect = page.locator('select').filter({ has: page.locator('option:has-text("No Lattosio")') }).first();
  const guestCountInput = page.locator('input[type="number"]').first();
  const addButton = page.locator('button:has-text("Aggiungi")').first();

  // Add first dietary restriction: No Lattosio, 2 guests
  await dietarySelect.selectOption('No Lattosio');
  await guestCountInput.fill('2');
  await addButton.click();
  await page.waitForTimeout(500);

  // Add second dietary restriction: No Glutine, 1 guest
  await dietarySelect.selectOption('No Glutine');
  await guestCountInput.fill('1');
  await addButton.click();
  await page.waitForTimeout(500);

  // Add third dietary restriction: Vegano, 3 guests
  await dietarySelect.selectOption('Vegano');
  await guestCountInput.fill('3');
  await addButton.click();
  await page.waitForTimeout(500);

  // Scroll to show both menu section cards (at top) and dietary restriction cards (below)
  // First scroll to the dietary cards section to see all 3 cards
  const dietaryCardsHeading = page.locator('text=Intolleranze inserite:');
  await dietaryCardsHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  // Scroll up slightly to get menu cards in view too
  await page.evaluate(() => {
    window.scrollBy(0, -400);
  });
  await page.waitForTimeout(500);

  // Take full page screenshot showing both sections
  await page.screenshot({
    path: 'e2e/screenshots/dietary-vs-menu-cards-comparison.png',
    fullPage: true
  });

  // Verify that we have 3 dietary restriction cards (using .first() to avoid strict mode issues)
  await expect(page.locator('span.font-bold.text-gray-900').filter({ hasText: 'No Lattosio' }).first()).toBeVisible();
  await expect(page.locator('span.font-bold.text-gray-900').filter({ hasText: 'No Glutine' }).first()).toBeVisible();
  await expect(page.locator('span.font-bold.text-gray-900').filter({ hasText: 'Vegano' }).first()).toBeVisible();
});
