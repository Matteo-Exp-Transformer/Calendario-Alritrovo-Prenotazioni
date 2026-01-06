import { test, expect } from '@playwright/test';

test('add dietary restrictions and take screenshot with menu comparison', async ({ page }) => {
  console.log('Navigating to booking page...');
  await page.goto('http://localhost:5175/prenota', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Selecting "Rinfresco di Laurea" booking type...');
  // Find the booking type select dropdown and select "Rinfresco di Laurea"
  const bookingTypeSelect = page.locator('select').first();
  await bookingTypeSelect.selectOption({ label: 'Rinfresco di Laurea' });
  await page.waitForTimeout(1000);

  console.log('Scrolling to dietary restrictions section...');
  const dietarySection = page.locator('text=Intolleranze e Richieste Speciali').first();
  await dietarySection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  console.log('Adding first dietary restriction: No Lattosio, 2 guests...');
  // No Lattosio is already selected, just need to enter guest count
  const guestCountInput = page.locator('input[type="number"]').last();
  const addButton = page.locator('button:has-text("Aggiungi")');

  // Enter 2 guests (No Lattosio is already selected)
  await guestCountInput.clear();
  await guestCountInput.fill('2');
  await page.waitForTimeout(300);
  // Click Aggiungi button
  await addButton.click();
  await page.waitForTimeout(500);

  console.log('Adding second dietary restriction: No Glutine, 1 guest...');
  // Now select No Glutine
  const dietaryRestrictionSelect = page.locator('select').last();
  await dietaryRestrictionSelect.selectOption({ label: 'No Glutine' });
  await page.waitForTimeout(300);
  await guestCountInput.clear();
  await guestCountInput.fill('1');
  await page.waitForTimeout(300);
  await addButton.click();
  await page.waitForTimeout(500);

  console.log('Adding third dietary restriction: Vegano, 3 guests...');
  await dietaryRestrictionSelect.selectOption({ label: 'Vegano' });
  await page.waitForTimeout(300);
  await guestCountInput.clear();
  await guestCountInput.fill('3');
  await page.waitForTimeout(300);
  await addButton.click();
  await page.waitForTimeout(500);

  console.log('Scrolling to show menu card and all dietary restrictions...');
  // Scroll to show the "Intolleranze inserite:" section
  const insertedSection = page.locator('text=Intolleranze inserite:').first();
  await insertedSection.scrollIntoViewIfNeeded();

  // Scroll up a bit to include a menu card
  await page.evaluate(() => window.scrollBy(0, -300));
  await page.waitForTimeout(500);

  console.log('Taking full page screenshot...');
  await page.screenshot({
    path: 'e2e/screenshots/dietary-cards-with-menu-comparison-AFTER.png',
    fullPage: true
  });

  console.log('Screenshot saved successfully!');
  console.log('Screenshot path: e2e/screenshots/dietary-cards-with-menu-comparison-AFTER.png');
});
