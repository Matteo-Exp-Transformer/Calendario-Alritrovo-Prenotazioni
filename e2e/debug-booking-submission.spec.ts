import { test, expect } from '@playwright/test';

test.describe('Debug Booking Submission Flow', () => {
  test('capture console logs and modal behavior on booking submission', async ({ page }) => {
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(text);
      console.log(text); // Also output to test console
    });

    // Capture console errors separately
    page.on('pageerror', error => {
      const text = `[PAGE ERROR] ${error.message}`;
      consoleErrors.push(text);
      console.error(text);
    });

    // Navigate to booking page
    console.log('\n=== NAVIGATING TO BOOKING PAGE ===');
    await page.goto('http://localhost:5174/prenota');
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial state
    await page.screenshot({ path: 'e2e/screenshots/debug-booking-initial.png', fullPage: true });
    console.log('Screenshot saved: debug-booking-initial.png');

    // Fill out the form
    console.log('\n=== FILLING OUT FORM ===');

    // Nome
    await page.fill('#client_name', 'Test User');
    console.log('Filled: Nome = Test User');

    // Email
    await page.fill('#client_email', 'test@example.com');
    console.log('Filled: Email = test@example.com');

    // Telefono
    await page.fill('#client_phone', '1234567890');
    console.log('Filled: Telefono = 1234567890');

    // Tipo di prenotazione
    console.log('Selecting: Tipo di prenotazione = tavolo');
    await page.selectOption('#booking_type', 'tavolo');
    console.log('Selected: tavolo');

    // Data - future date (using custom DateInput component with select dropdowns)
    console.log('Selecting: Data');
    const dateContainer = page.locator('#desired_date');
    const daySelect = dateContainer.locator('select').first();
    const monthSelect = dateContainer.locator('select[aria-label="Mese"]');
    const yearSelect = dateContainer.locator('select[aria-label="Anno"]');

    await daySelect.selectOption('24'); // Day 24
    await monthSelect.selectOption('11'); // November
    await yearSelect.selectOption('2025'); // Year 2025
    console.log('Selected: 24 November 2025');

    // Ora (using custom TimeInput component with select dropdowns)
    console.log('Selecting: Ora = 19:00');
    const timeContainer = page.locator('#desired_time');
    const hourSelect = timeContainer.locator('select').first();
    const minuteSelect = timeContainer.locator('select').last();

    await hourSelect.selectOption('19'); // Hour 19
    await minuteSelect.selectOption('00'); // Minute 00 (string, not number)
    console.log('Selected: 19:00');

    // Numero Ospiti
    await page.fill('#num_guests', '4');
    console.log('Filled: Numero Ospiti = 4');

    // Accept privacy checkbox
    const privacyCheckboxLabel = page.locator('label[for="privacy-consent"]').first();
    if (await privacyCheckboxLabel.count() > 0) {
      await privacyCheckboxLabel.click();
      console.log('Checked: Privacy checkbox (label click)');
    } else {
      // Try alternative selector
      const privacyCheckbox = page.locator('input[type="checkbox"][id*="privacy"], input[type="checkbox"][name*="privacy"]').first();
      if (await privacyCheckbox.count() > 0) {
        await privacyCheckbox.check();
        console.log('Checked: Privacy checkbox (alternative selector)');
      }
    }

    // Take screenshot before submit
    await page.screenshot({ path: 'e2e/screenshots/debug-booking-before-submit.png', fullPage: true });
    console.log('Screenshot saved: debug-booking-before-submit.png');

    console.log('\n=== CLICKING SUBMIT BUTTON ===');
    const submitButton = page.locator('button:has-text("Invia Prenotazione")');
    await expect(submitButton).toBeVisible();

    // Clear previous console logs to focus on submit action
    consoleLogs.length = 0;
    consoleErrors.length = 0;

    // Click submit
    await submitButton.click();
    console.log('Submit button clicked!');

    // Wait for potential async operations
    await page.waitForTimeout(3000);

    // Take screenshot after submit
    await page.screenshot({ path: 'e2e/screenshots/debug-booking-after-submit.png', fullPage: true });
    console.log('Screenshot saved: debug-booking-after-submit.png');

    // Check if modal appeared
    console.log('\n=== CHECKING FOR MODAL ===');
    const modal = page.locator('[role="dialog"]');
    const isModalVisible = await modal.isVisible().catch(() => false);
    console.log(`Modal visible: ${isModalVisible}`);

    if (isModalVisible) {
      await page.screenshot({ path: 'e2e/screenshots/debug-booking-modal-visible.png', fullPage: true });
      console.log('Screenshot saved: debug-booking-modal-visible.png');
    }

    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Output all console logs from submit action
    console.log('\n=== CONSOLE LOGS FROM SUBMIT ACTION ===');
    if (consoleLogs.length > 0) {
      consoleLogs.forEach(log => console.log(log));
    } else {
      console.log('No console logs captured');
    }

    // Output any errors
    console.log('\n=== CONSOLE ERRORS ===');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.error(error));
    } else {
      console.log('No console errors captured');
    }

    // Check for any error messages on page
    console.log('\n=== CHECKING FOR ERROR MESSAGES ON PAGE ===');
    const errorMessages = await page.locator('.error, .alert, [role="alert"]').allTextContents();
    if (errorMessages.length > 0) {
      console.log('Error messages found:', errorMessages);
    } else {
      console.log('No error messages found on page');
    }

    // Final state summary
    console.log('\n=== FINAL STATE SUMMARY ===');
    console.log(`Modal appeared: ${isModalVisible}`);
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Console logs count: ${consoleLogs.length}`);
    console.log(`Console errors count: ${consoleErrors.length}`);
  });
});
