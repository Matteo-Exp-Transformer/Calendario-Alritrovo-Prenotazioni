import { test } from '@playwright/test';

test.describe('Final Validation Test', () => {
  test('Empty form scroll and toast', async ({ page }) => {
    await page.goto('http://localhost:5174/prenota');
    await page.waitForLoadState('networkidle');
    const sb = await page.evaluate(() => window.scrollY);
    console.log('Before:', sb);
    await page.click('button:has-text("Invia Prenotazione")');
    await page.waitForTimeout(700);
    const sa = await page.evaluate(() => window.scrollY);
    console.log('After:', sa, 'Delta:', sa - sb);
    await page.screenshot({ path: 'e2e/screenshots/test-final-1.png', fullPage: true });
  });

  test('Error styling', async ({ page }) => {
    await page.goto('http://localhost:5174/prenota');
    await page.waitForLoadState('networkidle');
    await page.fill('#client_email', 'test@test.com');
    await page.fill('#client_phone', '123');
    await page.fill('#num_guests', '4');
    await page.check('#privacy-consent', { force: true });
    await page.click('button:has-text("Invia Prenotazione")');
    await page.waitForTimeout(1000);
    const nc = await page.locator('input[name="client_name"]').getAttribute('class');
    console.log('Nome classes:', nc);
    await page.screenshot({ path: 'e2e/screenshots/test-final-2.png', fullPage: true });
  });
});