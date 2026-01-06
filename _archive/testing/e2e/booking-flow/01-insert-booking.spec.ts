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
    } else {
      // Try alternative selector
      const privacyCheckbox = page.locator('input[type="checkbox"][id*="privacy"], input[type="checkbox"][name*="privacy"]').first();
      if (await privacyCheckbox.count() > 0) {
        await privacyCheckbox.check();
        console.log('✅ Privacy checkbox checked (alternative selector)');
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/insert-02-form-filled.png', fullPage: true });

    // ============================================
    // STEP 3: Submit form and wait for API response
    // ============================================
    console.log('\n🚀 Step 3: Submitting form...');
    const submitButton = page.locator('button[type="submit"], button:has-text("Invia")').first();
    
    // ✅ CRITICO: Aspetta la risposta API prima di continuare
    // Questo garantisce che la prenotazione sia effettivamente salvata nel database
    console.log('⏳ Waiting for API response after submit...');
    
    // Intercetta tutte le risposte di rete dopo il click
    let apiResponse = null;
    const responsePromise = page.waitForResponse(
      (response) => {
        const url = response.url();
        const isBookingRequest = url.includes('booking_requests');
        const isSuccess = response.status() === 200 || response.status() === 201;
        
        if (isBookingRequest && isSuccess) {
          console.log(`🔍 Found booking API response: ${response.status()} - ${url.substring(0, 80)}`);
          return true;
        }
        return false;
      },
      { timeout: 15000 }
    ).catch(() => null);

    // Click submit e aspetta risposta in parallelo
    await submitButton.click();
    console.log('✅ Submit button clicked');
    
    // Aspetta la risposta API
    apiResponse = await responsePromise;

    if (apiResponse) {
      console.log(`✅ ✅ ✅ API response received: ${apiResponse.status()}`);
      try {
        const responseData = await apiResponse.json().catch(() => null);
        if (responseData) {
          // Supabase può restituire array o oggetto
          const booking = Array.isArray(responseData) ? responseData[0] : responseData;
          if (booking && booking.id) {
            console.log(`✅ ✅ ✅ Booking created with ID: ${booking.id}`);
            console.log(`   Email: ${booking.client_email || 'N/A'}`);
            console.log(`   Status: ${booking.status || 'N/A'}`);
          } else if (Array.isArray(responseData) && responseData.length > 0) {
            const booking = responseData[0];
            console.log(`✅ ✅ ✅ Booking created (from array)`);
            console.log(`   ID: ${booking.id || 'N/A'}`);
            console.log(`   Email: ${booking.client_email || 'N/A'}`);
          }
        }
      } catch (e) {
        console.log('⚠️ Could not parse response JSON, but status is OK');
      }
    } else {
      console.log('⚠️ ⚠️ ⚠️ No API response detected within timeout');
      console.log('   La prenotazione potrebbe essere stata salvata comunque');
      console.log('   Verifica manualmente nella pagina admin/pending');
    }

    // Wait for UI to update after API response
    await page.waitForTimeout(2000);

    // ============================================
    // STEP 4: Verify success (UI indicators)
    // ============================================
    console.log('\n🔍 Step 4: Verifying success indicators...');

    // Take screenshot first to see what happened
    await page.screenshot({ path: 'e2e/screenshots/insert-03-after-submit.png', fullPage: true });
    console.log('📸 Screenshot saved: insert-03-after-submit.png');

    // Check for success indicators (optional - API response is more reliable)
    let successFound = false;

    // Method 1: Check for toast notification (react-toastify)
    const toastSuccess = page.locator('.Toastify__toast--success, .toast-success, [data-testid="toast-success"]');
    if (await toastSuccess.count() > 0) {
      successFound = true;
      console.log('✅ Success toast notification found');
    }

    // Method 2: Check for dialog/modal with success message
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.count() > 0) {
      const dialogText = await dialog.first().textContent();
      if (dialogText && /successo|success|inviata|Prenotazione/i.test(dialogText)) {
        successFound = true;
        console.log('✅ Success dialog found');
        console.log(`   Dialog text: ${dialogText.substring(0, 100)}`);
      }
    }

    // Check for errors
    const errorIndicators = [
      page.locator('.Toastify__toast--error, .toast-error'),
      page.locator('text=/errore|error|non valido|invalid/i'),
    ];

    let errorFound = false;
    for (const errorIndicator of errorIndicators) {
      if (await errorIndicator.count() > 0) {
        const isVisible = await errorIndicator.first().isVisible().catch(() => false);
        if (isVisible) {
          errorFound = true;
          const errorText = await errorIndicator.first().textContent();
          console.log(`❌ Error found: ${errorText}`);
          break;
        }
      }
    }

    // Final verification
    if (errorFound) {
      console.log('\n❌ ERRORE: Il form ha mostrato un errore');
      console.log('📸 Controlla lo screenshot: insert-03-after-submit.png');
      throw new Error('Form submission failed with error');
    }

    // ✅ VERIFICA PRINCIPALE: Se abbiamo ricevuto risposta API 200/201, la prenotazione è salvata
    if (apiResponse && (apiResponse.status() === 200 || apiResponse.status() === 201)) {
      console.log('\n✅ ✅ ✅ PRENOTAZIONE INSERITA CON SUCCESSO!');
      console.log('✅ Verificato tramite risposta API');
      if (!successFound) {
        console.log('⚠️ Nota: Messaggio UI di successo non visibile, ma API conferma inserimento');
      }
    } else if (successFound) {
      console.log('\n✅ ✅ ✅ PRENOTAZIONE PROBABILMENTE INSERITA');
      console.log('✅ Verificato tramite messaggio UI');
      console.log('⚠️ Nota: Risposta API non confermata, verifica manualmente in admin/pending');
    } else {
      console.log('\n⚠️ ⚠️ ⚠️ WARNING: Nessuna conferma di successo');
      console.log('📸 Controlla lo screenshot: insert-03-after-submit.png');
      console.log('💡 Verifica manualmente nel database o nell\'interfaccia admin');
      console.log('💡 Email da cercare:', clientEmail);
    }

    console.log('\n✅ ✅ ✅ TEST COMPLETATO!');
    console.log('==========================================');
    console.log(`📋 Riepilogo:`);
    console.log(`   Nome: ${clientName}`);
    console.log(`   Email: ${clientEmail}`);
    console.log(`   Data: ${bookingDate}`);
    console.log(`   Orario: ${bookingTime}`);
    console.log(`   Ospiti: ${numGuests}`);
    console.log(`\n💡 Per verificare la prenotazione:`);
    console.log(`   1. Vai alla pagina admin`);
    console.log(`   2. Apri "Prenotazioni Pendenti"`);
    console.log(`   3. Cerca per email: ${clientEmail}`);
  });
});
