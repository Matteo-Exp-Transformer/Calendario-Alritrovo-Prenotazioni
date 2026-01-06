import { test, expect } from '@playwright/test';

test.describe('Booking Form Validation Improvements', () => {
  test('should show toast and scroll to first error on empty form submission', async ({ page }) => {
    // Capture console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log('Browser console:', text);
    });

    // Navigate to booking form
    await page.goto('http://localhost:5174/prenota');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: 'e2e/screenshots/validation-test-01-initial.png', fullPage: true });

    // Fill ONLY the name field
    await page.fill('#client_name', 'Test User');

    // Take screenshot after filling name
    await page.screenshot({ path: 'e2e/screenshots/validation-test-02-name-filled.png', fullPage: true });

    // Get initial scroll position
    const scrollBeforeSubmit = await page.evaluate(() => window.scrollY);
    console.log('Scroll position before submit:', scrollBeforeSubmit);

    // Click submit button
    await page.click('button:has-text("Invia Prenotazione")');

    // Wait for validation to trigger and toast to appear
    await page.waitForTimeout(1500);

    // Take screenshot after submit attempt
    await page.screenshot({ path: 'e2e/screenshots/validation-test-03-after-submit.png', fullPage: true });

    // Check for toast notification with multiple selectors
    const toastSelectors = [
      '.Toastify__toast',
      '.Toastify__toast--error',
      '[role="alert"]',
      '.toast',
      '[data-sonner-toast]'
    ];

    let toastVisible = false;
    let toastText = '';

    for (const selector of toastSelectors) {
      const toast = page.locator(selector);
      if (await toast.isVisible().catch(() => false)) {
        toastVisible = true;
        toastText = await toast.textContent() || '';
        console.log(`Toast found with selector: ${selector}`);
        console.log('Toast text:', toastText);
        break;
      }
    }

    console.log('Toast visible:', toastVisible);

    // Get scroll position after submit
    const scrollAfterSubmit = await page.evaluate(() => window.scrollY);
    console.log('Scroll position after submit:', scrollAfterSubmit);
    console.log('Scroll change:', scrollAfterSubmit - scrollBeforeSubmit);

    // Check for visible error messages (p tags with text-red-500)
    const errorMessages = page.locator('p.text-red-500');
    const errorCount = await errorMessages.count();
    console.log('Visible error messages (p.text-red-500):', errorCount);

    // Log all error messages
    for (let i = 0; i < errorCount; i++) {
      const errorText = await errorMessages.nth(i).textContent();
      console.log(`Error ${i + 1}:`, errorText);
    }

    // Log some console messages for debugging
    console.log('Total console messages:', consoleMessages.length);
    console.log('Sample console messages:', consoleMessages.slice(0, 10));
  });

  test('should validate business hours (Monday closure)', async ({ page }) => {
    // Navigate to booking form
    await page.goto('http://localhost:5174/prenota');
    await page.waitForLoadState('networkidle');

    // Fill all required fields with VALID data
    await page.fill('#client_name', 'Test User');
    await page.fill('#client_email', 'test@example.com');
    await page.fill('#client_phone', '1234567890');

    // Select "Prenota un Tavolo" (already default, but set it explicitly)
    await page.selectOption('#booking_type', 'tavolo');

    // Select a Monday date (next Monday from today)
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
    const mondayString = nextMonday.toISOString().split('T')[0];
    console.log('Selected Monday date:', mondayString);

    // Parse the Monday date
    const [yearStr, monthStr, dayStr] = mondayString.split('-');
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const monthIndex = parseInt(monthStr, 10);
    const monthName = monthNames[monthIndex - 1];

    // Select date using the three dropdowns
    await page.selectOption('#desired_date_day', dayStr);
    await page.selectOption('#desired_date_month', monthStr);
    await page.selectOption('#desired_date_year', yearStr);

    // Select time (19:00 = 19 hour, 00 minutes)
    await page.selectOption('#desired_time_hour', '19');
    await page.selectOption('#desired_time_minute', '00');

    // Fill guests
    await page.fill('#num_guests', '4');

    // Accept privacy (use force because label intercepts clicks)
    await page.check('#privacy-consent', { force: true });

    // Take screenshot before submit
    await page.screenshot({ path: 'e2e/screenshots/validation-test-05-monday-filled.png', fullPage: true });

    // Get initial scroll position
    const scrollBeforeSubmit = await page.evaluate(() => window.scrollY);
    console.log('Scroll position before submit:', scrollBeforeSubmit);

    // Click submit
    await page.click('button:has-text("Invia Prenotazione")');

    // Wait for validation
    await page.waitForTimeout(500);

    // Take screenshot after submit
    await page.screenshot({ path: 'e2e/screenshots/validation-test-06-monday-error.png', fullPage: true });

    // Check for toast
    const toast = page.locator('[role="status"], [role="alert"], .toast, [data-sonner-toast]');
    const toastVisible = await toast.isVisible().catch(() => false);
    console.log('Toast visible:', toastVisible);

    if (toastVisible) {
      const toastText = await toast.textContent();
      console.log('Toast text:', toastText);
    }

    // Get scroll position after submit
    const scrollAfterSubmit = await page.evaluate(() => window.scrollY);
    console.log('Scroll position after submit:', scrollAfterSubmit);

    // Check for Monday closure error message
    const mondayError = page.locator('text=/Il ristorante è chiuso.*lunedì/i');
    const mondayErrorVisible = await mondayError.isVisible().catch(() => false);
    console.log('Monday closure error visible:', mondayErrorVisible);

    if (mondayErrorVisible) {
      const errorText = await mondayError.textContent();
      console.log('Monday error text:', errorText);
    }

    // Check all error messages
    const errorMessages = page.locator('.text-red-500, .text-destructive, [class*="error"]');
    const errorCount = await errorMessages.count();
    console.log('Total visible error messages:', errorCount);
  });
});
