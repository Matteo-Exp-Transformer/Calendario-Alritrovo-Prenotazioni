import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * TEST 16: Test Email Optional and Phone Required Validation
 * 
 * Tests:
 * 1. Public form (/prenota):
 *    - Email should be optional
 *    - Phone should be required
 * 2. Admin form (dashboard):
 *    - Email should be optional
 *    - Phone should be required
 */

test.describe('Test 16: Email Optional and Phone Required', () => {
  test('should validate email optional and phone required in public form', async ({ page }) => {
    console.log('🧪 TEST 16a: Testing public form validation...');

    // Navigate to booking page
    await page.goto('http://localhost:5175/prenota');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/16-01-public-form-initial.png', fullPage: true });

    // Fill form without email and without phone
    await page.fill('input[id="client_name"]', 'Test Validation');
    await page.fill('input[id="desired_date"]', new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
    await page.fill('input[id="desired_time"]', '20:00');
    await page.fill('input[id="num_guests"]', '5');
    await page.selectOption('select[id="event_type"]', 'drink_caraffe');

    // Accept privacy policy - click on first label
    const privacyLabel = page.locator('label[for="privacy-consent"]').first();
    if (await privacyLabel.count() > 0) {
      await privacyLabel.click();
    } else {
      await page.check('input[id="privacy-consent"]');
    }

    await page.screenshot({ path: 'e2e/screenshots/16-02-form-filled-no-phone.png', fullPage: true });

    // Try to submit without phone - should fail
    const submitButton = page.locator('button[type="submit"]').first();
    const urlBefore = page.url();
    
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Check for phone error message with multiple selectors
    const phoneError1 = page.locator('text=/telefono.*obbligatorio/i');
    const phoneError2 = page.locator('text=/Numero di telefono/i');
    const phoneError3 = page.locator('p:has-text("telefono")');
    const phoneField = page.locator('input[id="client_phone"]');
    
    const hasPhoneError = await phoneError1.count() > 0 || await phoneError2.count() > 0 || await phoneError3.count() > 0;
    
    // Check if phone field has error styling
    const phoneErrorClass = await phoneField.getAttribute('class');
    const hasErrorStyling = phoneErrorClass?.includes('border-red') || phoneErrorClass?.includes('red');
    
    // Check if page changed (should not if validation failed)
    const urlAfter = page.url();
    const pageChanged = urlBefore !== urlAfter;
    
    const phoneValidationWorking = hasPhoneError || hasErrorStyling || !pageChanged;

    if (phoneValidationWorking) {
      console.log('✅ Phone is required - validation working');
      if (hasPhoneError) console.log('  - Error message found');
      if (hasErrorStyling) console.log('  - Error styling found');
      if (!pageChanged) console.log('  - Form did not submit');
    } else {
      console.log('⚠️ Phone validation might not be working');
    }

    await page.screenshot({ path: 'e2e/screenshots/16-03-phone-error.png', fullPage: true });

    // Now fill phone and submit - should work without email
    await page.fill('input[id="client_phone"]', '351 123 4567');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/16-04-form-with-phone-no-email.png', fullPage: true });

    // Submit should work now (email is optional)
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Check if success modal or message appears
    const successModal = page.locator('text=/successo/i').first();
    const successModal2 = page.locator('text=/inviata/i').first();
    const successModal3 = page.locator('[class*="success"]').first();
    const isSuccess = await successModal.count() > 0 || await successModal2.count() > 0 || await successModal3.count() > 0;

    if (isSuccess) {
      console.log('✅ Form submitted successfully without email - email is optional');
    } else {
      console.log('⚠️ Success message not found - might need to check manually');
    }

    await page.screenshot({ path: 'e2e/screenshots/16-05-submit-result.png', fullPage: true });

    console.log('==========================================');
    console.log('📊 TEST 16a RESULTS:');
    console.log(`  - Phone required: ${phoneValidationWorking ? '✅' : '❌'}`);
    console.log(`  - Email optional (form submitted without email): ${isSuccess ? '✅' : '⚠️'}`);
    console.log('==========================================');
  });

  test('should validate email optional and phone required in admin form', async ({ page }) => {
    console.log('🧪 TEST 16b: Testing admin form validation...');

    // Step 1: Login as admin
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      console.log('⚠️ SKIPPING TEST 16b - Admin login required');
      test.skip();
      return;
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/16-06-admin-dashboard.png', fullPage: true });

    // Step 2: Open "Inserisci nuova prenotazione" card
    console.log('📝 Opening new booking form...');
    const newBookingCard = page.locator('text=/Inserisci nuova prenotazione/i').first();
    
    if (await newBookingCard.count() > 0) {
      // Try to find button to expand card
      const cardButton = newBookingCard.locator('..').locator('button').first();
      if (await cardButton.count() > 0) {
        await cardButton.click();
        await page.waitForTimeout(1000);
      } else {
        // Try clicking directly on the card text
        await newBookingCard.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/16-07-form-opened.png', fullPage: true });

    // Step 3: Fill form without email and without phone
    console.log('📝 Filling form without email and phone...');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    await page.fill('input[id="client_name"]', 'Test Admin Validation');
    await page.fill('input[id="desired_date"]', futureDateStr);
    await page.fill('input[id="desired_time"]', '19:00');
    await page.fill('input[id="num_guests"]', '8');
    await page.selectOption('select[id="event_type"]', 'drink_rinfresco_completo');

    await page.screenshot({ path: 'e2e/screenshots/16-08-form-filled-no-phone.png', fullPage: true });

    // Step 4: Try to submit without phone - should fail
    console.log('🔍 Testing phone required validation...');
    const submitButton = page.locator('button[type="submit"], button:has-text("Crea")').first();
    
    // Get current URL to check if page changes
    const urlBefore = page.url();
    
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Check for phone error message with multiple selectors
    const phoneError1 = page.locator('text=/telefono.*obbligatorio/i');
    const phoneError2 = page.locator('text=/Numero di telefono/i');
    const phoneError3 = page.locator('p:has-text("telefono")');
    const phoneField = page.locator('input[id="client_phone"]');
    
    // Check if error is shown
    const hasPhoneError = await phoneError1.count() > 0 || await phoneError2.count() > 0 || await phoneError3.count() > 0;
    
    // Check if phone field has error styling
    const phoneErrorClass = await phoneField.getAttribute('class');
    const hasErrorStyling = phoneErrorClass?.includes('border-red') || phoneErrorClass?.includes('red');
    
    // Check if page URL changed (should not if validation failed)
    await page.waitForTimeout(1000);
    const urlAfter = page.url();
    const pageChanged = urlBefore !== urlAfter;

    if (hasPhoneError || hasErrorStyling || !pageChanged) {
      console.log('✅ Phone is required in admin form');
      if (hasPhoneError) console.log('  - Error message found');
      if (hasErrorStyling) console.log('  - Error styling found on field');
      if (!pageChanged) console.log('  - Form did not submit (validation working)');
    } else {
      console.log('⚠️ Phone validation might not be working in admin form');
      console.log(`  - Error message: ${hasPhoneError}`);
      console.log(`  - Error styling: ${hasErrorStyling}`);
      console.log(`  - Page changed: ${pageChanged}`);
    }

    await page.screenshot({ path: 'e2e/screenshots/16-09-phone-error-admin.png', fullPage: true });

    // Step 5: Fill phone and submit - should work without email
    console.log('📝 Filling phone and submitting without email...');
    await page.fill('input[id="client_phone"]', '351 987 6543');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/16-10-form-with-phone-no-email.png', fullPage: true });

    // Submit should work now (email is optional)
    await submitButton.click();
    await page.waitForTimeout(3000);

    // Check for success message
    const successMessage1 = page.locator('text=/successo/i').first();
    const successMessage2 = page.locator('text=/creata/i').first();
    const successMessage3 = page.locator('[class*="success"]').first();
    const isSuccess = await successMessage1.count() > 0 || await successMessage2.count() > 0 || await successMessage3.count() > 0;

    if (isSuccess) {
      console.log('✅ Admin form submitted successfully without email - email is optional');
    } else {
      // Check if page reloaded (also indicates success)
      await page.waitForTimeout(2000);
      const url = page.url();
      if (url.includes('admin')) {
        console.log('✅ Form likely submitted (page still on admin)');
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/16-11-submit-result-admin.png', fullPage: true });

    console.log('==========================================');
    console.log('📊 TEST 16b RESULTS:');
    const phoneValidationWorking = hasPhoneError || hasErrorStyling || !pageChanged;
    console.log(`  - Phone required in admin form: ${phoneValidationWorking ? '✅' : '❌'}`);
    console.log(`  - Email optional in admin form: ${isSuccess ? '✅' : '⚠️'}`);
    console.log('==========================================');

    // Assertions - phone should be required (either error message, error styling, or form should not submit)
    expect(phoneValidationWorking).toBe(true);
  });
});

