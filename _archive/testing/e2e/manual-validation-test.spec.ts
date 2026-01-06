import { test, expect } from '@playwright/test';

test.describe('Manual Validation Test', () => {
  test('Empty form submission - capture toast immediately', async ({ page }) => {
    // Navigate to booking form
    await page.goto('http://localhost:5174/prenota');
    await page.waitForLoadState('networkidle');

    console.log('=== Test 1: Empty form with scroll and toast ===');

    // Get initial scroll position
    const scrollBefore = await page.evaluate(() => window.scrollY);
    console.log('Initial scroll position:', scrollBefore);

    // Wait for toast to appear using Promise.all to avoid race condition
    const [toast] = await Promise.all([
      page.waitForSelector('.Toastify__toast', { timeout: 5000 }).catch(() => null),
      page.click('button:has-text("Invia Prenotazione")')
    ]);

    // Small delay for scroll animation
    await page.waitForTimeout(300);

    // Get scroll position after submit
    const scrollAfter = await page.evaluate(() => window.scrollY);
    console.log('Scroll position after submit:', scrollAfter);
    console.log('Scroll changed by:', scrollAfter - scrollBefore, 'pixels');

    // Check if toast is visible
    if (toast) {
      const toastText = await toast.textContent();
      console.log('Toast visible: YES');
      console.log('Toast message:', toastText);
    } else {
      console.log('Toast visible: NO (timeout or not found)');
    }

    // Take screenshot immediately
    await page.screenshot({
      path: 'e2e/screenshots/manual-test-1-empty-form-with-toast.png',
      fullPage: true
    });

    console.log('\n');
  });

  test('Date/Time error styling with Monday', async ({ page }) => {
    // Navigate to booking form
    await page.goto('http://localhost:5174/prenota');
    await page.waitForLoadState('networkidle');

    console.log('=== Test 2: Date/Time error styling consistency ===');

    // Leave Nome empty (to trigger error on regular input)
    // Fill other fields
    await page.fill('input[name="client_email"]', 'test@example.com');
    await page.fill('input[name="client_phone"]', '1234567890');

    // Select Rinfresco di Laurea
    await page.selectOption('#booking_type', 'rinfresco_laurea');
    await page.waitForTimeout(500);

    // Select a Monday date (closed day)
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
    const [yearStr, monthStr, dayStr] = nextMonday.toISOString().split('T')[0].split('-');

    await page.selectOption('#desired_date_day', dayStr);
    await page.selectOption('#desired_date_month', monthStr);
    await page.selectOption('#desired_date_year', yearStr);

    // Select valid time
    await page.selectOption('#desired_time_hour', '12');
    await page.selectOption('#desired_time_minute', '00');

    // Fill guests
    await page.fill('#num_guests', '4');

    // Accept privacy
    await page.check('#privacy-consent', { force: true });

    console.log('Selected Monday:', nextMonday.toISOString().split('T')[0]);

    // Submit and wait for validation
    await page.click('button:has-text("Invia Prenotazione")');
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/manual-test-2-date-time-errors.png',
      fullPage: true
    });

    // Check Nome input error styling
    const nomeInput = page.locator('input[name="client_name"]');
    const nomeClasses = await nomeInput.getAttribute('class');
    console.log('Nome input classes:', nomeClasses);
    console.log('Nome has error border:', nomeClasses?.includes('border-red') || nomeClasses?.includes('border-destructive'));

    // Check DateInput error styling
    const dateContainer = page.locator('.date-input-container');
    const dateClasses = await dateContainer.getAttribute('class');
    console.log('Date container classes:', dateClasses);
    console.log('Date input has error class:', dateClasses?.includes('error'));

    // Check TimeInput error styling
    const timeContainer = page.locator('.time-input-container');
    const timeClasses = await timeContainer.getAttribute('class');
    console.log('Time container classes:', timeClasses);
    console.log('Time input has error class:', timeClasses?.includes('error'));

    // Get computed border color for comparison
    const nomeBorderColor = await nomeInput.evaluate(el => 
      window.getComputedStyle(el).borderColor
    );
    const dateBorderColor = await dateContainer.evaluate(el =>
      window.getComputedStyle(el).borderColor
    );

    console.log('Nome border color:', nomeBorderColor);
    console.log('Date border color:', dateBorderColor);
    console.log('Border colors match:', nomeBorderColor === dateBorderColor);
  });
});
