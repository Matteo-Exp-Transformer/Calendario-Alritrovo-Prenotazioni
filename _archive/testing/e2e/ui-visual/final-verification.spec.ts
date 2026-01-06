import { test, expect } from '@playwright/test';

test.describe('Final Verification - Uniform Styling', () => {
  test('should show uniform styling between menu cards and dietary cards', async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 1024 });

    // Navigate to booking page
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');

    // Select "Rinfresco di Laurea" to show menu and dietary sections
    await page.selectOption('select#booking_type', 'rinfresco_laurea');
    await page.waitForTimeout(2000);

    // Find the dietary restrictions section
    const intolleranzeH2 = page.locator('h2').filter({ hasText: 'Intolleranze' });
    await expect(intolleranzeH2).toBeVisible({ timeout: 15000 });
    
    const dietaryCard = intolleranzeH2.locator('xpath=ancestor::div[contains(@class, "bg-white/95")]').first();
    await expect(dietaryCard).toBeVisible({ timeout: 5000 });
    await dietaryCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Find dietary restriction select within the card
    const restrictionSelect = page.locator('select').filter({ 
      has: page.locator('option:has-text("No Lattosio")') 
    });
    
    // Add first dietary restriction: No Lattosio
    await restrictionSelect.selectOption('No Lattosio');
    
    const guestCountInput = dietaryCard.locator('input[type="number"]').first();
    await guestCountInput.fill('2');
    
    const addButton = dietaryCard.locator('button:has-text("Aggiungi")');
    await addButton.click();
    await page.waitForTimeout(500);

    // Add second dietary restriction: Vegano
    await restrictionSelect.selectOption('Vegano');
    await guestCountInput.fill('1');
    await addButton.click();
    await page.waitForTimeout(800);

    // Scroll up to show menu section and dietary section in same viewport
    await page.evaluate(() => {
      // Scroll to a position that shows both sections
      window.scrollBy(0, -400);
    });
    await page.waitForTimeout(500);

    // Take screenshot showing the comparison
    await page.screenshot({
      path: 'e2e/screenshots/FINAL-verification-uniform-styling.png',
      fullPage: false
    });

    console.log('Screenshot saved successfully!');
  });
});
