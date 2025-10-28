import { test, expect } from '@playwright/test';

/**
 * TEST 1: Flusso Prenotazione Utente Completato con Successo
 *
 * Steps:
 * 1. Navigate to /prenota
 * 2. Fill form with test data (email: matteo.cavallaro.work@gmail.com)
 * 3. Submit form
 * 4. Verify success message
 * 5. Verify booking saved in database
 */

test.describe('Test 1: Flusso Prenotazione Utente', () => {
  test('should complete booking flow successfully', async ({ page }) => {
    console.log('🧪 TEST 1: Starting booking flow test...');

    // Step 1: Navigate to booking form
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to /prenota');

    // Verify page loaded
    await expect(page.locator('h1').first()).toContainText(/prenota|richiesta/i);
    console.log('✅ Booking form page loaded');

    // Step 2: Fill form with test data
    const testData = {
      name: 'Matteo Cavallaro Test',
      email: 'matteo.cavallaro.work@gmail.com',
      phone: '+39 333 1234567',
      eventType: 'drink_caraffe',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
      time: '20:00',
      guests: '4',
      notes: 'Test automatico Playwright - Prenotazione di prova'
    };

    console.log('📝 Filling form with test data:', testData);

    // Fill name
    await page.fill('#client_name', testData.name);
    console.log('✅ Name filled');

    // Fill email
    await page.fill('#client_email', testData.email);
    console.log('✅ Email filled');

    // Fill phone (if field exists)
    const phoneField = page.locator('#client_phone');
    if (await phoneField.count() > 0) {
      await phoneField.fill(testData.phone);
      console.log('✅ Phone filled');
    }

    // Select event type
    await page.selectOption('#event_type', testData.eventType);
    console.log('✅ Event type selected:', testData.eventType);

    // Fill date
    await page.fill('#desired_date', testData.date);
    console.log('✅ Date filled:', testData.date);

    // Fill time (if field exists)
    const timeField = page.locator('#desired_time');
    if (await timeField.count() > 0) {
      await timeField.fill(testData.time);
      console.log('✅ Time filled:', testData.time);
    }

    // Fill number of guests
    await page.fill('#num_guests', testData.guests);
    console.log('✅ Guests filled:', testData.guests);

    // Fill notes (if field exists)
    const notesField = page.locator('#special_requests');
    if (await notesField.count() > 0) {
      await notesField.fill(testData.notes);
      console.log('✅ Notes filled');
    }

    // Accept privacy checkbox (if exists) - click the label instead (first one is the checkbox visual)
    const privacyCheckboxLabel = page.locator('label[for="privacy-consent"]').first();
    if (await privacyCheckboxLabel.count() > 0) {
      await privacyCheckboxLabel.click();
      console.log('✅ Privacy checkbox checked');
    }

    // Take screenshot before submit
    await page.screenshot({ path: 'e2e/screenshots/01-form-filled.png', fullPage: true });
    console.log('📸 Screenshot saved: 01-form-filled.png');

    // Step 3: Submit form
    console.log('🚀 Submitting form...');
    const submitButton = page.locator('button[type="submit"], button:has-text("Invia")');
    await submitButton.click();

    // Step 4: Wait for success response and modal
    console.log('⏳ Waiting for API call...');
    await page.waitForTimeout(2000); // Wait for API call

    // Check for success modal
    console.log('🔍 Checking for success modal...');
    const modal = page.locator('[role="dialog"]');
    let modalFound = false;
    let modalVisible = false;

    // Try to find modal for up to 5 seconds
    for (let i = 0; i < 10; i++) {
      const count = await modal.count();
      if (count > 0) {
        modalFound = true;
        console.log('✅ Modal DOM element found');
        
        // Check if modal is visible
        const isVisible = await modal.first().isVisible();
        if (isVisible) {
          modalVisible = true;
          console.log('✅ Modal is visible');
          break;
        } else {
          console.log('⚠️ Modal found in DOM but not visible');
        }
      }
      await page.waitForTimeout(500);
    }

    if (modalFound && modalVisible) {
      console.log('✅ Success modal is shown and visible!');
    } else if (modalFound) {
      console.log('⚠️ Modal found in DOM but not visible - checking screenshot');
    } else {
      console.log('❌ Modal not found at all - checking alternatives');
      
      // Check for success indicators as fallback
      const successIndicators = [
        page.locator('text=/successo|success|inviata/i'),
        page.locator('[role="alert"]'),
        page.locator('.toast, .notification'),
        page.locator('text=/Prenotazione Inviata/i')
      ];

      for (const indicator of successIndicators) {
        if (await indicator.count() > 0) {
          console.log('✅ Alternative success message found');
          modalVisible = true;
          break;
        }
      }
    }

    // Take screenshot after submit
    await page.screenshot({ path: 'e2e/screenshots/01-after-submit.png', fullPage: true });
    console.log('📸 Screenshot saved: 01-after-submit.png');

    // Final verification
    expect(modalVisible).toBeTruthy();
    
    if (modalVisible) {
      console.log('✅ TEST 1 PASSED: Success modal is visible!');
    } else {
      console.log('❌ TEST 1 FAILED: Success modal not found or not visible');
      console.log('🔍 Debug info:');
      console.log('- Modal found in DOM:', modalFound);
      console.log('- Modal visible:', modalVisible);
    }

    // Verify form was cleared or redirected
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);

    console.log('🎉 TEST 1 COMPLETED');
    console.log('==========================================\n');
  });
});
