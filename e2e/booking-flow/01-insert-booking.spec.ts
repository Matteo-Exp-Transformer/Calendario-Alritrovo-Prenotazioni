import { test, expect } from '@playwright/test';

/**
 * TEST: Inserimento Prenotazione
 * 
 * Questo test inserisce una prenotazione nel sistema.
 * 
 * PER MODIFICARE I DATI DELLA PRENOTAZIONE, CAMBIA QUESTI VALORI:
 * 
 * 📅 DATA: Cambia `bookingDate` (formato: YYYY-MM-DD)
 * ⏰ ORARIO: Cambia `bookingTime` (formato: HH:MM)
 * 👤 NOME: Cambia `clientName` 
 * 📧 EMAIL: Generata automaticamente (modifica `clientName` per cambiarla)
 * 👥 OSPITI: Cambia `numGuests`
 * 
 * Esempi:
 * - Data tra 7 giorni: `new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]`
 * - Data tra 14 giorni: `new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]`
 * - Data specifica: `'2025-12-25'`
 */

test.describe('Inserimento Prenotazione', () => {
  test('deve inserire una prenotazione correttamente', async ({ page }) => {
    console.log('🧪 TEST: Inserimento Prenotazione');
    console.log('==================================\n');

    // ============================================
    // ⚙️ CONFIGURAZIONE: MODIFICA QUESTI VALORI
    // ============================================
    const timestamp = Date.now();
    
    // 📅 DATA: Modifica questa riga per cambiare la data
    const bookingDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +7 giorni
    
    // ⏰ ORARIO: Modifica questa riga per cambiare l'orario (formato: HH:MM)
    const bookingTime = '20:30';
    
    // 👤 NOME: Modifica questa riga per cambiare il nome
    const clientName = `Test User ${timestamp}`;
    
    // 📧 EMAIL: Generata automaticamente (usa timestamp per unicità)
    const clientEmail = `test.${timestamp}@test.com`;
    
    // 📱 TELEFONO: Modifica questa riga per cambiare il telefono (opzionale)
    const clientPhone = '+39 333 1234567';
    
    // 👥 OSPITI: Modifica questa riga per cambiare il numero di ospiti
    const numGuests = '4';
    
    // 🎯 TIPO PRENOTAZIONE: 'tavolo' o 'rinfresco_laurea'
    const bookingType = 'tavolo';
    
    // 📝 NOTE: Note speciali (opzionale)
    const specialRequests = 'Test automatico - Inserimento prenotazione';

    console.log(`📋 Dati Prenotazione:`);
    console.log(`   Nome: ${clientName}`);
    console.log(`   Email: ${clientEmail}`);
    console.log(`   Data: ${bookingDate}`);
    console.log(`   Orario: ${bookingTime}`);
    console.log(`   Ospiti: ${numGuests}`);
    console.log(`   Tipo: ${bookingType}\n`);

    // ============================================
    // STEP 1: Navigate to booking form
    // ============================================
    console.log('📝 Step 1: Navigate to booking form...');
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to /prenota');

    await page.screenshot({ path: 'e2e/screenshots/insert-01-form-page.png', fullPage: true });

    // ============================================
    // STEP 2: Fill form
    // ============================================
    console.log('\n📝 Step 2: Filling booking form...');

    // Fill name
    const nameField = page.locator('#client_name');
    await nameField.waitFor({ state: 'visible', timeout: 5000 });
    await nameField.fill(clientName);
    console.log(`✅ Name filled: ${clientName}`);

    // Fill email
    const emailField = page.locator('#client_email');
    await emailField.fill(clientEmail);
    console.log(`✅ Email filled: ${clientEmail}`);

    // Fill phone (if field exists)
    const phoneField = page.locator('#client_phone');
    if (await phoneField.count() > 0) {
      await phoneField.fill(clientPhone);
      console.log(`✅ Phone filled: ${clientPhone}`);
    }

    // Select booking type
    const bookingTypeField = page.locator('#booking_type');
    if (await bookingTypeField.count() > 0) {
      await bookingTypeField.selectOption(bookingType);
      console.log(`✅ Booking type selected: ${bookingType}`);
    } else {
      console.log('⚠️ Booking type field not found, continuing...');
    }

    // Fill date
    const dateField = page.locator('#desired_date');
    await dateField.fill(bookingDate);
    console.log(`✅ Date filled: ${bookingDate}`);

    // Fill time
    const timeField = page.locator('#desired_time');
    if (await timeField.count() > 0) {
      await timeField.fill(bookingTime);
      console.log(`✅ Time filled: ${bookingTime}`);
    } else {
      console.log('⚠️ Time field not found');
    }

    // Fill number of guests
    const guestsField = page.locator('#num_guests');
    await guestsField.fill(numGuests);
    console.log(`✅ Guests filled: ${numGuests}`);

    // Fill notes (optional)
    const notesField = page.locator('#special_requests');
    if (await notesField.count() > 0) {
      await notesField.fill(specialRequests);
      console.log('✅ Notes filled');
    }

    // Accept privacy checkbox
    const privacyCheckboxLabel = page.locator('label[for="privacy-consent"]').first();
    if (await privacyCheckboxLabel.count() > 0) {
      await privacyCheckboxLabel.click();
      console.log('✅ Privacy checkbox checked');
    }

    await page.screenshot({ path: 'e2e/screenshots/insert-02-form-filled.png', fullPage: true });

    // ============================================
    // STEP 3: Submit form
    // ============================================
    console.log('\n🚀 Step 3: Submitting form...');
    const submitButton = page.locator('button[type="submit"], button:has-text("Invia")');
    await submitButton.click();
    console.log('✅ Submit button clicked');

    // Wait for API call
    await page.waitForTimeout(2000);

    // ============================================
    // STEP 4: Verify success
    // ============================================
    console.log('\n🔍 Step 4: Verifying success...');

    // Check for success modal or message
    const successIndicators = [
      page.locator('[role="dialog"]'),
      page.locator('text=/successo|success|inviata|Prenotazione Inviata/i'),
      page.locator('[role="alert"]'),
      page.locator('.toast, .notification'),
    ];

    let successFound = false;
    for (const indicator of successIndicators) {
      if (await indicator.count() > 0) {
        const isVisible = await indicator.first().isVisible().catch(() => false);
        if (isVisible) {
          successFound = true;
          console.log('✅ Success message found');
          break;
        }
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/insert-03-after-submit.png', fullPage: true });

    expect(successFound).toBeTruthy();

    console.log('\n✅ ✅ ✅ TEST COMPLETATO CON SUCCESSO!');
    console.log('==========================================');
    console.log(`📋 Riepilogo:`);
    console.log(`   Nome: ${clientName}`);
    console.log(`   Email: ${clientEmail}`);
    console.log(`   Data: ${bookingDate}`);
    console.log(`   Orario: ${bookingTime}`);
    console.log(`   Ospiti: ${numGuests}`);
    console.log('\n✅ Prenotazione inserita correttamente!');
  });
});

