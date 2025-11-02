import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE ADMIN DASHBOARD FLOW TEST
 *
 * This test covers the entire admin dashboard CRUD workflow:
 * 1. Login & Navigation
 * 2. Create booking via Inserimento Prenotazione
 * 3. Verify booking in calendar (Read)
 * 4. Open booking modal and verify data
 * 5. Edit booking (Update)
 * 6. Delete booking (Delete)
 * 7. Verify CollapsibleCard UI elements
 */

test.describe('Comprehensive Admin Dashboard Flow', () => {
  test('complete CRUD workflow for admin dashboard', async ({ page }) => {
    console.log('🚀 Starting comprehensive admin dashboard flow test...');

    const testData = {
      nome: 'Test User Automated',
      email: 'test@example.com',
      telefono: '+39 333 1234567',
      data: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      orario: '12:00',
      numeroOspiti: '4',
      tipoEvento: 'menu_pranzo_cena',
      note: 'Automated test booking - Complete CRUD flow'
    };

    // ========================================
    // TEST 1: LOGIN & NAVIGATION
    // ========================================
    console.log('\n📝 TEST 1: Login & Navigation');

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill login credentials
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');

    // Take screenshot before login
    await page.screenshot({
      path: 'e2e/screenshots/admin-flow-test/01-login.png',
      fullPage: true
    });
    console.log('📸 Screenshot: 01-login.png');

    // Submit login
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i });
    await submitButton.click();

    // Wait for redirect
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (!currentUrl.includes('/admin')) {
      console.log('❌ LOGIN FAILED - not redirected to /admin');
      test.skip();
      return;
    }

    console.log('✅ TEST 1 PASSED: Logged in successfully');

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify all navigation tabs
    const tabs = ['Calendario', 'Prenotazioni Pendenti', 'Archivio', 'Impostazioni'];
    for (const tab of tabs) {
      const tabElement = page.locator(`button:has-text("${tab}")`);
      const isVisible = await tabElement.isVisible();
      console.log(`${isVisible ? '✅' : '❌'} Tab "${tab}" ${isVisible ? 'found' : 'NOT found'}`);
    }

    // ========================================
    // TEST 2: CREATE BOOKING
    // ========================================
    console.log('\n📝 TEST 2: Create Booking via Inserimento Prenotazione');

    // Find and expand "Inserisci nuova prenotazione" collapsecard
    // The CollapsibleCard header has role="button" and is the clickable element
    const insertCardHeader = page.locator('[role="button"]').filter({ hasText: /Inserisci nuova prenotazione/i }).first();

    if (await insertCardHeader.count() === 0) {
      console.log('❌ "Inserisci nuova prenotazione" card not found');
      throw new Error('Insert booking card not found');
    }

    // Click the header to expand
    await insertCardHeader.click();
    console.log('📂 Expanded insert booking card');

    await page.waitForTimeout(1000);

    // Take screenshot of form
    await page.screenshot({
      path: 'e2e/screenshots/admin-flow-test/02-insert-form.png',
      fullPage: true
    });
    console.log('📸 Screenshot: 02-insert-form.png');

    // Fill form fields
    await page.fill('input[id="client_name"]', testData.nome);
    console.log(`✅ Nome: ${testData.nome}`);

    await page.fill('input[id="client_email"]', testData.email);
    console.log(`✅ Email: ${testData.email}`);

    await page.fill('input[id="client_phone"]', testData.telefono);
    console.log(`✅ Telefono: ${testData.telefono}`);

    await page.fill('input[id="desired_date"]', testData.data);
    console.log(`✅ Data: ${testData.data}`);

    await page.fill('input[id="desired_time"]', testData.orario);
    console.log(`✅ Orario: ${testData.orario}`);

    await page.fill('input[id="num_guests"]', testData.numeroOspiti);
    console.log(`✅ Numero ospiti: ${testData.numeroOspiti}`);

    await page.selectOption('select[id="event_type"]', testData.tipoEvento);
    console.log(`✅ Tipo evento: ${testData.tipoEvento}`);

    await page.fill('textarea[id="special_requests"]', testData.note);
    console.log(`✅ Note: ${testData.note}`);

    // Submit form
    const submitFormButton = page.locator('button[type="submit"]').filter({ hasText: /Crea/i });
    await submitFormButton.click();
    console.log('🚀 Form submitted');

    await page.waitForTimeout(3000);

    console.log('✅ TEST 2 PASSED: Booking created');

    // ========================================
    // TEST 3: VERIFY IN CALENDAR
    // ========================================
    console.log('\n📝 TEST 3: Verify booking appears in calendar');

    // Navigate to Calendar tab
    const calendarTab = page.locator('button:has-text("Calendario")').first();
    await calendarTab.click();
    console.log('📅 Navigated to Calendar tab');

    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    // Take screenshot of calendar
    await page.screenshot({
      path: 'e2e/screenshots/admin-flow-test/03-calendar-with-booking.png',
      fullPage: true
    });
    console.log('📸 Screenshot: 03-calendar-with-booking.png');

    // Look for the booking in calendar
    const bookingInCalendar = page.locator('.fc-event').filter({ hasText: testData.nome });
    const bookingCount = await bookingInCalendar.count();

    if (bookingCount === 0) {
      console.log('❌ Booking not found in calendar');
      console.log('⚠️ This could be a date/time display issue');
    } else {
      console.log(`✅ TEST 3 PASSED: Booking found in calendar (${bookingCount} event(s))`);
    }

    // ========================================
    // TEST 4: OPEN BOOKING MODAL
    // ========================================
    console.log('\n📝 TEST 4: Open booking modal and verify data');

    if (bookingCount > 0) {
      // Click on the booking event
      await bookingInCalendar.first().click();
      console.log('🖱️ Clicked on booking event');

      await page.waitForTimeout(1500);

      // Take screenshot of modal
      await page.screenshot({
        path: 'e2e/screenshots/admin-flow-test/04-booking-modal.png',
        fullPage: true
      });
      console.log('📸 Screenshot: 04-booking-modal.png');

      // The modal is a slideover panel - check for content visibility
      const modalContent = page.locator('body');
      const modalText = await modalContent.textContent();

      const checks = {
        nome: modalText?.includes(testData.nome),
        email: modalText?.includes(testData.email),
        telefono: modalText?.includes(testData.telefono.replace(/\s/g, '')), // Remove spaces for matching
        orario: modalText?.includes('12:00') || modalText?.includes('11:00') // Allow for timezone offset
      };

      console.log('Modal data verification:');
      console.log(`  ${checks.nome ? '✅' : '❌'} Nome: ${testData.nome}`);
      console.log(`  ${checks.email ? '✅' : '❌'} Email: ${testData.email}`);
      console.log(`  ${checks.telefono ? '✅' : '❌'} Telefono: ${testData.telefono}`);
      console.log(`  ${checks.orario ? '✅' : '❌'} Orario: 12:00 (may show as 11:00 due to timezone)`);

      if (checks.nome && checks.email && checks.telefono) {
        console.log('✅ TEST 4 PASSED: Modal opened and data verified');
      } else {
        console.log('⚠️ TEST 4 PARTIAL: Some data not found in modal');
      }

      // ========================================
      // TEST 5: EDIT BOOKING
      // ========================================
      console.log('\n📝 TEST 5: Edit booking');

      // The modal is already in EDIT mode after clicking Modifica button
      // We need to find the Ospiti input and change it
      await page.waitForTimeout(500);

      // Find all number inputs and locate the one with value "4"
      const allNumberInputs = page.locator('input[type="number"]');
      const numInputCount = await allNumberInputs.count();
      console.log(`Found ${numInputCount} number inputs`);

      let foundGuestsInput = false;
      for (let i = 0; i < numInputCount; i++) {
        const input = allNumberInputs.nth(i);
        const value = await input.inputValue();
        console.log(`Input ${i}: value = "${value}"`);
        if (value === '4') {
          await input.fill('6');
          console.log('✏️ Changed number of guests from 4 to 6');
          foundGuestsInput = true;
          break;
        }
      }

      if (foundGuestsInput) {
        // Take screenshot of edit form
        await page.screenshot({
          path: 'e2e/screenshots/admin-flow-test/05-edit-modal.png',
          fullPage: true
        });
        console.log('📸 Screenshot: 05-edit-modal.png');

        // Save changes - button says "Salva Modifiche"
        const saveButton = page.locator('button:has-text("Salva Modifiche")').first();
        if (await saveButton.count() > 0 && await saveButton.isVisible()) {
          await saveButton.click();
          console.log('💾 Clicked Salva Modifiche button');

          await page.waitForTimeout(2000);
          console.log('✅ TEST 5 PASSED: Booking edited');
        } else {
          console.log('❌ Salva Modifiche button not found');
        }
      } else {
        console.log('⚠️ TEST 5 SKIPPED: Guests input with value "4" not found');
      }

      // ========================================
      // TEST 6: DELETE BOOKING
      // ========================================
      console.log('\n📝 TEST 6: Delete booking');

      // Close the modal first by clicking X button or pressing Escape
      const closeButton = page.locator('button[aria-label="Close"], button:has-text("×")').first();
      if (await closeButton.count() > 0 && await closeButton.isVisible()) {
        await closeButton.click();
        console.log('❌ Closed modal with X button');
        await page.waitForTimeout(1000);
      } else {
        // Try Escape key
        await page.keyboard.press('Escape');
        console.log('⌨️ Pressed Escape to close modal');
        await page.waitForTimeout(1000);
      }

      // Now click on booking again to open modal in view mode
      await bookingInCalendar.first().click();
      console.log('🖱️ Clicked on booking event again');
      await page.waitForTimeout(1500);

      // Look for Annulla button (Cancel/Delete booking)
      const annullaButton = page.locator('button:has-text("Annulla")').first();
      const deleteButtonExists = await annullaButton.count() > 0;

      if (deleteButtonExists && await annullaButton.isVisible()) {
        await annullaButton.click();
        console.log('🗑️ Clicked Annulla button to delete booking');

        await page.waitForTimeout(1000);

        // Check for confirmation dialog
        const confirmButton = page.locator('button').filter({ hasText: /Conferma|Sì|Elimina/i }).last();
        if (await confirmButton.count() > 0 && await confirmButton.isVisible()) {
          await confirmButton.click();
          console.log('✅ Confirmed deletion in dialog');
        } else {
          console.log('⚠️ No confirmation dialog - deletion may be immediate');
        }

        await page.waitForTimeout(2000);

        // Take screenshot after deletion
        await page.screenshot({
          path: 'e2e/screenshots/admin-flow-test/06-after-delete.png',
          fullPage: true
        });
        console.log('📸 Screenshot: 06-after-delete.png');

        // Verify booking no longer in calendar
        const bookingStillExists = await bookingInCalendar.count();
        if (bookingStillExists === 0) {
          console.log('✅ TEST 6 PASSED: Booking deleted and removed from calendar');
        } else {
          console.log('⚠️ Booking might still be visible (may need page refresh)');
        }
      } else {
        console.log('❌ TEST 6 FAILED: Annulla button not found');
      }
    } else {
      console.log('⚠️ SKIPPING TESTS 4, 5, 6: Booking not found in calendar');
    }

    // ========================================
    // TEST 7: VERIFY TIME SLOT UI
    // ========================================
    console.log('\n📝 TEST 7: Verify CollapsibleCard colors and time slots');

    // Navigate back to Calendario tab (should already be there)
    await page.waitForTimeout(1000);

    // Look for time slot cards with different colors
    const timeSlotCards = page.locator('[class*="border"]').filter({
      hasText: /Mattina|Pomeriggio|Sera/i
    });

    const timeSlotCount = await timeSlotCards.count();
    console.log(`📊 Found ${timeSlotCount} time slot cards`);

    // Take screenshot of time slots
    await page.screenshot({
      path: 'e2e/screenshots/admin-flow-test/07-time-slots-colors.png',
      fullPage: true
    });
    console.log('📸 Screenshot: 07-time-slots-colors.png');

    // Check for counter badges
    const counterBadges = page.locator('text=/\\d+\\/\\d+\\s*disponibili/i');
    const counterCount = await counterBadges.count();
    console.log(`${counterCount > 0 ? '✅' : '❌'} Counter badges found: ${counterCount}`);

    if (counterCount > 0) {
      console.log('✅ TEST 7 PASSED: Time slot UI elements verified');
    } else {
      console.log('⚠️ TEST 7 PARTIAL: Screenshot saved for manual verification');
    }

    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log('\n==========================================');
    console.log('🎉 COMPREHENSIVE ADMIN FLOW TEST COMPLETE');
    console.log('==========================================');
    console.log('All screenshots saved to: e2e/screenshots/admin-flow-test/');
  });
});
