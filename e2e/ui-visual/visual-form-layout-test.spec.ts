import { test, expect } from '@playwright/test';

test.describe('Visual Form Layout Verification', () => {
  test('should verify booking form layout on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to booking form
    await page.goto('http://localhost:5175/prenota');

    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });

    // Take full page screenshot
    await page.screenshot({
      path: 'e2e/screenshots/form-layout-desktop.png',
      fullPage: true
    });

    // Verify form container exists and check its layout
    const formContainer = page.locator('form').first();
    await expect(formContainer).toBeVisible();

    // Check for section headers
    const datiPersonaliHeader = page.locator('text=Dati Personali');
    const dettagliPrenotazioneHeader = page.locator('text=Dettagli Prenotazione');

    await expect(datiPersonaliHeader).toBeVisible();
    await expect(dettagliPrenotazioneHeader).toBeVisible();

    // Check form width constraint (should be centered with max-width)
    const formBox = await formContainer.boundingBox();
    console.log('Desktop Form Box:', formBox);

    // Verify dropdown exists
    const tipologiaDropdown = page.locator('select, [role="combobox"]').first();
    await expect(tipologiaDropdown).toBeVisible();

    // Verify submit button
    const submitButton = page.locator('button:has-text("Invia Prenotazione")');
    await expect(submitButton).toBeVisible();
  });

  test('should verify booking form layout on mobile', async ({ page }) => {
    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to booking form
    await page.goto('http://localhost:5175/prenota');

    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/form-layout-mobile.png',
      fullPage: true
    });

    // Verify form container
    const formContainer = page.locator('form').first();
    await expect(formContainer).toBeVisible();

    // Check for section headers
    const datiPersonaliHeader = page.locator('text=Dati Personali');
    const dettagliPrenotazioneHeader = page.locator('text=Dettagli Prenotazione');

    await expect(datiPersonaliHeader).toBeVisible();
    await expect(dettagliPrenotazioneHeader).toBeVisible();

    // Check form takes full width (with padding)
    const formBox = await formContainer.boundingBox();
    console.log('Mobile Form Box:', formBox);

    // Verify all inputs are visible
    const tipologiaDropdown = page.locator('select, [role="combobox"]').first();
    await expect(tipologiaDropdown).toBeVisible();

    const submitButton = page.locator('button:has-text("Invia Prenotazione")');
    await expect(submitButton).toBeVisible();
  });
});

