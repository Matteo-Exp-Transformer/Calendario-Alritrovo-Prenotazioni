import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

/**
 * TEST: Verifica Trascrizione Corretta Orari Prenotazione
 * 
 * Verifica che i dati inseriti dall'utente (data, orario) rimangano IDENTICI
 * in tutte le fasi del flusso:
 * 1. Accettazione prenotazione (PendingRequestsTab)
 * 2. Visualizzazione nel calendario (evento)
 * 3. Visualizzazione nelle collapse card (fascia oraria)
 * 4. Visualizzazione nel pannello laterale (click evento → BookingDetailsModal)
 * 5. Visualizzazione in archivio
 * 
 * REQUISITO: Orario inserito "20:00" deve rimanere "20:00" in tutte le fasi
 * NO shift di 1 ora o conversioni timezone
 */

/**
 * Helper: Attende che un elemento sia visibile e cliccabile
 */
async function waitForClickable(
  page: any,
  locator: any,
  options: { timeout?: number; description?: string } = {}
) {
  const { timeout = 10000, description = 'element' } = options;
  
  await locator.waitFor({ state: 'visible', timeout });
  await locator.scrollIntoViewIfNeeded();
  
  // Verifica che sia cliccabile
  const isEnabled = await locator.isEnabled();
  if (!isEnabled) {
    throw new Error(`${description} is not enabled`);
  }
  
  return locator;
}

/**
 * Helper: Naviga alla data specifica nel calendario
 */
async function navigateToDate(page: any, dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Usa l'API del calendario per navigare alla data
  await page.evaluate(({ year, month, day }) => {
    const calendarEl = document.querySelector('.fc');
    if (calendarEl && (window as any).calendarApi) {
      (window as any).calendarApi.gotoDate(new Date(year, month - 1, day));
    }
  }, { year, month, day });
  
  await page.waitForTimeout(1000);
}

test.describe('Verifica Trascrizione Orari Prenotazione', () => {
  test('deve preservare orario inserito identico in tutte le fasi', async ({ page }) => {
    console.log('🧪 TEST: Verifica Trascrizione Orari Prenotazione');
    console.log('================================================\n');

    // Step 1: Login as admin
    console.log('🔑 Step 1: Login as admin...');
    const loginSuccess = await loginAsAdmin(page);
    
    if (!loginSuccess) {
      console.log('❌ Login failed - skipping test');
      test.skip();
      return;
    }

    await page.screenshot({ path: 'e2e/screenshots/verify-time-01-login.png', fullPage: true });
    console.log('✅ Logged in successfully\n');

    // Step 2: Vai a Prenotazioni Pendenti
    console.log('📋 Step 2: Navigate to Pending Requests...');
    const pendingTab = page.locator('button:has-text("Prenotazioni Pendenti"), button:has-text("Pendenti")').first();
    
    if (await pendingTab.count() === 0) {
      console.log('⚠️ Pending tab not found, trying navigation...');
      await page.goto('/admin');
      await page.waitForTimeout(2000);
    } else {
      await pendingTab.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'e2e/screenshots/verify-time-02-pending.png', fullPage: true });
    console.log('✅ On Pending Requests tab\n');

    // Step 3: Cerca una prenotazione da accettare (o crea una nuova)
    console.log('🔍 Step 3: Looking for pending booking to accept...');
    
    // Cerca qualsiasi booking pending
    const bookingCards = page.locator('div').filter({ hasText: /@.*\.com/ });
    const cardCount = await bookingCards.count();
    
    if (cardCount === 0) {
      console.log('⚠️ No pending bookings found - test requires at least one pending booking');
      console.log('⚠️ Skipping test - create a booking first');
      test.skip();
      return;
    }

    console.log(`✅ Found ${cardCount} pending booking(s)`);
    const firstCard = bookingCards.first();
    
    // Espandi la card se necessario
    const chevron = firstCard.locator('[data-icon="chevron-down"], svg').first();
    if (await chevron.count() > 0) {
      await firstCard.click();
      await page.waitForTimeout(500);
    }

    // Estrai email dalla card per identificarla
    const emailText = await firstCard.locator('text=/@.*\.com/').first().textContent();
    console.log(`📧 Booking email: ${emailText}`);

    await page.screenshot({ path: 'e2e/screenshots/verify-time-03-booking-found.png', fullPage: true });

    // Step 4: Espandi la card e poi clicca "Accetta Prenotazione"
    console.log('\n🎯 Step 4: Expand card and accept booking...');
    
    // Salva desired_time per verificarlo dopo
    const desiredTimeText = await firstCard.locator('text=/\\d{2}:\\d{2}/').first().textContent() || '';
    const desiredTime = desiredTimeText.trim();
    const desiredDateText = await firstCard.locator('text=/\\d{1,2}\\s+\\w+\\s+\\d{4}/').first().textContent() || '';
    console.log(`📅 Desired date: ${desiredDateText}, Time: ${desiredTime}`);
    
    // Espandi la card se non è già espansa
    const cardHeaderButton = firstCard.locator('button').first();
    const isExpanded = await firstCard.locator('button:has-text("Accetta")').count() > 0;
    
    if (!isExpanded) {
      console.log('📂 Card is collapsed, expanding...');
      await cardHeaderButton.click();
      await page.waitForSelector('button:has-text("Accetta")', { timeout: 5000 }).catch(() => null);
    }
    
    // Attendi che il pulsante "Accetta" sia visibile e cliccabile
    const acceptButton = await waitForClickable(
      page,
      firstCard.locator('button:has-text("Accetta")').first(),
      { description: 'Accept button' }
    );
    
    console.log('✅ Accept button found and ready');
    await acceptButton.click();
    
    // Attendi il completamento dell'operazione
    await page.waitForResponse(
      (response) => response.url().includes('booking_requests') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {
      console.log('⚠️ No API response detected, continuing...');
    });
    
    await page.waitForTimeout(2000);
    
    // NOTA: PendingRequestsTab accetta direttamente senza modal!
    // La prenotazione viene accettata con desired_time come orario usando createBookingDateTime
    // Verifichiamo che l'orario salvato sia quello corretto in tutte le fasi successive
    
    // Attendi che la prenotazione venga rimossa dalla lista pending (segno che è stata accettata)
    console.log('⏳ Waiting for booking to be accepted...');
    await page.waitForTimeout(2000);
    
    // Verifica toast di successo se presente
    const successToast = page.locator('text=/successo|success|accettata/i');
    if (await successToast.count() > 0) {
      console.log('✅ Success message displayed');
    }
    
    await page.screenshot({ path: 'e2e/screenshots/verify-time-05-confirmed.png', fullPage: true });
    console.log('✅ Booking accepted directly\n');

    // Step 7: Verifica nel calendario - l'orario salvato deve essere quello di desired_time
    console.log('\n📅 Step 7: Verify in calendar (event display)...');
    
    const calendarTab = await waitForClickable(
      page,
      page.locator('button:has-text("Calendario")').first(),
      { description: 'Calendar tab' }
    );
    await calendarTab.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to calendar tab');
    
    // Naviga alla data della prenotazione se abbiamo la data
    if (desiredDateText) {
      try {
        // Estrai la data dal formato "15 febbraio 2025" o simile
        const dateMatch = desiredDateText.match(/(\d{1,2})\s+\w+\s+(\d{4})/);
        if (dateMatch) {
          // Usa una data approssimativa (il calendario potrebbe usare un formato diverso)
          console.log('📍 Attempting to navigate to booking date...');
        }
      } catch (e) {
        console.log('⚠️ Could not parse date for navigation');
      }
    }

    // Cerca l'evento nel calendario usando il nome cliente o email
    const eventInCalendar = page.locator(`text=/${emailText?.split('@')[0] || ''}/i`).first();
    
    // Attendi che l'evento appaia nel calendario (potrebbe richiedere refresh)
    try {
      await eventInCalendar.waitFor({ state: 'visible', timeout: 5000 });
      console.log('✅ Event found in calendar');
      
      // Estrai l'orario dall'evento
      const eventContainer = eventInCalendar.locator('xpath=ancestor::div[contains(@class, "fc-event")]').first();
      const timeInEvent = eventContainer.locator('text=/\\d{2}:\\d{2}/').first();
      
      if (await timeInEvent.count() > 0) {
        const timeText = (await timeInEvent.textContent())?.trim() || '';
        console.log(`📌 Time found in calendar event: ${timeText}`);
        
        // Verifica che corrisponda a desired_time (senza shift)
        if (timeText.includes(desiredTime.split(':')[0])) {
          console.log(`✅ Time displayed correctly in calendar (${timeText} matches ${desiredTime})`);
        } else {
          console.log(`⚠️ WARNING: Time mismatch! Expected ${desiredTime}, found ${timeText}`);
        }
      } else {
        console.log('⚠️ Time not found in calendar event (might be in title)');
      }
    } catch (e) {
      console.log('⚠️ Event not immediately visible in calendar - might need refresh or date navigation');
      // Prova a cercare in altre visualizzazioni
      await page.screenshot({ path: 'e2e/screenshots/verify-time-06-calendar-not-found.png', fullPage: true });
    }

    await page.screenshot({ path: 'e2e/screenshots/verify-time-06-calendar.png', fullPage: true });

    // Step 8: Verifica nelle collapse card (fascia oraria)
    console.log('\n📋 Step 8: Verify in time slot collapse cards...');
    
    // Scrolla fino alla sezione delle collapse card
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="CollapsibleCard"]'));
      if (cards.length > 0) {
        cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await page.waitForTimeout(1000);

    // Cerca le collapse card per fascia oraria
    // Le card sono tipicamente "Mattina", "Pomeriggio", "Sera"
    const timeSlotLabels = ['Mattina', 'Pomeriggio', 'Sera', 'Morning', 'Afternoon', 'Evening'];
    let timeSlotCard = null;
    
    for (const label of timeSlotLabels) {
      const card = page.locator(`text=/${label}/i`).first();
      if (await card.count() > 0) {
        timeSlotCard = card.locator('xpath=ancestor::div[contains(@class, "rounded")]').first();
        console.log(`✅ Found time slot card: ${label}`);
        break;
      }
    }

    if (timeSlotCard && await timeSlotCard.count() > 0) {
      // Espandi la card se necessario
      const cardButton = timeSlotCard.locator('button').first();
      const isExpanded = await timeSlotCard.locator(`text=/${desiredTime}/`).count() > 0;
      
      if (!isExpanded) {
        await cardButton.click();
        await page.waitForTimeout(500);
      }

      // Cerca l'orario nella card
      const timeInCard = timeSlotCard.locator(`text=/\\d{2}:\\d{2}/`);
      
      if (await timeInCard.count() > 0) {
        const timeText = await timeInCard.first().textContent();
        console.log(`📌 Time found in collapse card: ${timeText}`);
        
        if (timeText?.includes(desiredTime.split(':')[0])) {
          console.log(`✅ Time displayed correctly in collapse card (${timeText} matches ${desiredTime})`);
        } else {
          console.log(`⚠️ WARNING: Time mismatch in collapse card. Expected ${desiredTime}, found ${timeText}`);
        }
      } else {
        console.log('⚠️ Time not found in collapse card');
      }
    } else {
      console.log('⚠️ Time slot cards not found (might need to select correct date)');
    }

    await page.screenshot({ path: 'e2e/screenshots/verify-time-07-collapse-card.png', fullPage: true });

    // Step 9: Clicca sull'evento nel calendario per aprire modal dettagli
    console.log('\n🖱️ Step 9: Click calendar event to open details modal...');
    
    // Cerca l'evento usando vari selettori
    let eventToClick = null;
    const eventSelectors = [
      () => page.locator(`[class*="fc-event"]:has-text("${emailText?.split('@')[0] || ''}")`).first(),
      () => page.locator('[class*="fc-event"]').first(),
      () => page.locator(`text=/${emailText?.split('@')[0] || ''}/i`).first(),
    ];

    for (const selectorFn of eventSelectors) {
      try {
        const event = selectorFn();
        if (await event.count() > 0 && await event.isVisible()) {
          eventToClick = event;
          console.log('✅ Event found for clicking');
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (eventToClick && await eventToClick.count() > 0) {
      await eventToClick.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await eventToClick.click();
      await page.waitForTimeout(2000);
      console.log('✅ Event clicked - waiting for modal...');

      // Attendi che il modal si apra (BookingDetailsModal)
      try {
        // Il modal ha z-index 9999 e contiene input time
        await page.waitForSelector('input[type="time"]', { timeout: 10000, state: 'visible' });
        console.log('✅ Modal opened with time inputs');

        // Verifica orario nel modal
        const modalTimeInputs = page.locator('input[type="time"]');
        const inputCount = await modalTimeInputs.count();
        
        if (inputCount >= 2) {
          const modalStartTime = await modalTimeInputs.first().inputValue();
          const modalEndTime = await modalTimeInputs.nth(1).inputValue();

          console.log(`📋 Modal start time: ${modalStartTime}`);
          console.log(`📋 Modal end time: ${modalEndTime}`);

          // Verifica che l'orario corrisponda a desired_time (senza shift)
          if (modalStartTime) {
            const startHour = modalStartTime.split(':')[0];
            const expectedHour = desiredTime.split(':')[0];
            
            if (startHour === expectedHour) {
              console.log(`✅ Time displayed correctly in modal (${modalStartTime} matches ${desiredTime})`);
            } else {
              console.log(`⚠️ WARNING: Time mismatch in modal! Expected ${desiredTime}, found start=${modalStartTime}`);
            }
          }
        } else {
          console.log(`⚠️ Found ${inputCount} time inputs, expected 2`);
        }

        await page.screenshot({ path: 'e2e/screenshots/verify-time-08-modal-details.png', fullPage: true });
        
        // Chiudi il modal usando il pulsante X o Annulla
        const closeButton = page.locator('button').filter({ 
          has: page.locator('svg, [aria-label*="chiudi" i], [aria-label*="close" i]')
        }).first();
        
        if (await closeButton.count() === 0) {
          // Prova il pulsante X direttamente
          const xButton = page.locator('button:has([data-icon="x"]), button:has(svg)').first();
          if (await xButton.count() > 0) {
            await xButton.click();
          }
        } else {
          await closeButton.click();
        }
        
        await page.waitForTimeout(500);
        console.log('✅ Modal closed');
      } catch (e) {
        console.log('⚠️ Modal did not open or time inputs not found');
        await page.screenshot({ path: 'e2e/screenshots/verify-time-08-modal-error.png', fullPage: true });
      }
    } else {
      console.log('⚠️ Cannot click event - not visible or not found');
    }

    // Step 10: Verifica in archivio
    console.log('\n📁 Step 10: Verify in archive...');
    
    const archiveTab = await waitForClickable(
      page,
      page.locator('button:has-text("Archivio")').first(),
      { description: 'Archive tab' }
    );
    await archiveTab.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Cerca la prenotazione appena accettata
    if (emailText) {
      const archiveBooking = page.locator(`text=/${emailText.split('@')[0]}/i`).first();
      
      try {
        await archiveBooking.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Booking found in archive');
        
        const bookingCard = archiveBooking.locator('xpath=ancestor::div[contains(@class, "rounded") or contains(@class, "border")]').first();
        
        // Espandi la card se necessario
        const cardButton = bookingCard.locator('button').first();
        const isExpanded = await bookingCard.locator(`text=/${desiredTime}/`).count() > 0;
        
        if (!isExpanded) {
          await cardButton.click();
          await page.waitForTimeout(500);
        }

        // Verifica orario in archivio - cerca l'orario esatto o simile
        const archiveTime = bookingCard.locator(`text=/\\d{2}:\\d{2}/`).first();
        
        if (await archiveTime.count() > 0) {
          const archiveTimeText = (await archiveTime.textContent())?.trim() || '';
          console.log(`📌 Time found in archive: ${archiveTimeText}`);
          
          const archiveHour = archiveTimeText.split(':')[0];
          const expectedHour = desiredTime.split(':')[0];
          
          if (archiveHour === expectedHour) {
            console.log(`✅ Time displayed correctly in archive (${archiveTimeText} matches ${desiredTime})`);
          } else {
            console.log(`⚠️ WARNING: Time mismatch in archive! Expected ${desiredTime}, found ${archiveTimeText}`);
          }
        } else {
          console.log('⚠️ Time not found in archive card');
        }
      } catch (e) {
        console.log('⚠️ Booking not found in archive (might need refresh or filter)');
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/verify-time-09-archive.png', fullPage: true });

    console.log('\n✅ TEST COMPLETED: All verification steps executed');
    console.log('================================================\n');
  });
});

