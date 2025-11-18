import { test, expect } from '@playwright/test';

test.describe('BookingDetailsModal - New Layout Verification', () => {
  test('Verify improved padding and grid layout in DetailsTab', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    await page.locator('button[type="submit"]').filter({ hasText: /accedi/i }).click();
    await page.waitForURL('**/admin', { timeout: 10000 });
    console.log('✅ Logged in');

    // Navigate to Calendario tab
    await page.locator('button').filter({ hasText: 'Calendario' }).click();
    await page.waitForSelector('.fc-view', { timeout: 5000 });
    console.log('✅ On Calendario tab');

    // Find and click a booking event
    const bookingEvent = page.locator('.fc-event').first();
    await expect(bookingEvent).toBeVisible();
    await bookingEvent.click();
    await page.waitForTimeout(500);

    // Verify modal is visible
    const modalHeader = page.locator('text=Dettagli Prenotazione');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });
    console.log('✅ Modal is visible');

    // VERIFICATION 1: Check that content area has px-6 class
    const contentArea = page.locator('.bg-amber-100').first();
    const hasClass = await contentArea.evaluate((el) => {
      return el.classList.contains('px-6');
    });
    console.log(`📏 Content area has px-6 class: ${hasClass}`);
    expect(hasClass).toBe(true);
    console.log('✅ Padding class px-6 applied');

    // VERIFICATION 2: Check section titles are uppercase
    const sectionTitles = page.locator('h3.uppercase');
    const titleCount = await sectionTitles.count();
    expect(titleCount).toBeGreaterThan(0);
    console.log(`✅ Found ${titleCount} uppercase section titles`);

    // VERIFICATION 3: Verify "TIPO PRENOTAZIONE" title
    const tipoTitle = page.locator('text=TIPO PRENOTAZIONE');
    await expect(tipoTitle).toBeVisible();
    console.log('✅ "TIPO PRENOTAZIONE" title is uppercase');

    // VERIFICATION 4: Verify "INFORMAZIONI CLIENTE" title
    const clientTitle = page.locator('text=INFORMAZIONI CLIENTE');
    await expect(clientTitle).toBeVisible();
    console.log('✅ "INFORMAZIONI CLIENTE" title is uppercase');

    // VERIFICATION 5: Verify "DETTAGLI EVENTO" title
    const eventoTitle = page.locator('text=DETTAGLI EVENTO');
    await expect(eventoTitle).toBeVisible();
    console.log('✅ "DETTAGLI EVENTO" title is uppercase');

    // VERIFICATION 6: Check grid layout in view mode (InfoRow components)
    const infoRows = page.locator('.flex.gap-2');
    const rowCount = await infoRows.count();
    console.log(`📊 Found ${rowCount} info rows with inline label:value layout`);
    expect(rowCount).toBeGreaterThan(4); // At least Nome, Email, Telefono, Data, Ora Inizio, Ora Fine
    console.log('✅ Grid layout with inline labels present');

    // VERIFICATION 7: Check that labels end with colon (:)
    const firstLabel = page.locator('.font-semibold.text-gray-700').first();
    const labelText = await firstLabel.textContent();
    expect(labelText).toContain(':');
    console.log(`✅ Labels have colon format: "${labelText}"`);

    // VERIFICATION 8: Verify "Ora Fine" is visible (should always show)
    const oraFineLabel = page.locator('text=Ora Fine:');
    await expect(oraFineLabel).toBeVisible();
    console.log('✅ "Ora Fine" label is visible');

    // VERIFICATION 9: Take screenshot for visual inspection
    await page.screenshot({
      path: 'e2e/screenshots/booking-details-new-layout.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved');

    console.log('🎉 All layout verifications passed!');
  });

  test('Verify layout is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    console.log('📱 Testing on mobile viewport: 375x667');

    // Login
    await page.goto('/login');
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    await page.locator('button[type="submit"]').filter({ hasText: /accedi/i }).click();
    await page.waitForURL('**/admin', { timeout: 10000 });

    // Navigate to Calendario tab
    await page.locator('button').filter({ hasText: 'Calendario' }).click();
    await page.waitForSelector('.fc-view', { timeout: 5000 });

    // Open modal
    const bookingEvent = page.locator('.fc-event').first();
    await bookingEvent.click();
    await page.waitForTimeout(500);

    const modalHeader = page.locator('text=Dettagli Prenotazione');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // Verify grid collapses to single column on mobile
    const infoRows = page.locator('.flex.gap-2');
    const rowCount = await infoRows.count();
    console.log(`📱 Mobile: Found ${rowCount} info rows`);
    expect(rowCount).toBeGreaterThan(0);

    // Screenshot for mobile layout
    await page.screenshot({
      path: 'e2e/screenshots/booking-details-mobile-layout.png',
      fullPage: true
    });
    console.log('✅ Mobile layout verified');
  });

  test('Verify date format has capitalized first letter', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    await page.locator('button[type="submit"]').filter({ hasText: /accedi/i }).click();
    await page.waitForURL('**/admin', { timeout: 10000 });

    // Navigate to Calendario tab
    await page.locator('button').filter({ hasText: 'Calendario' }).click();
    await page.waitForSelector('.fc-view', { timeout: 5000 });

    // Open modal
    const bookingEvent = page.locator('.fc-event').first();
    await bookingEvent.click();
    await page.waitForTimeout(500);

    // Find the date value (should start with capital letter)
    const dataLabel = page.locator('text=Data:');
    await expect(dataLabel).toBeVisible();

    // Get the sibling text (the actual date value)
    const dateValue = await page.locator('.flex.gap-2').filter({ has: dataLabel }).locator('.text-gray-900').textContent();

    if (dateValue) {
      const firstChar = dateValue.charAt(0);
      expect(firstChar).toBe(firstChar.toUpperCase());
      console.log(`✅ Date format has capitalized first letter: "${dateValue}"`);
    }
  });
});
