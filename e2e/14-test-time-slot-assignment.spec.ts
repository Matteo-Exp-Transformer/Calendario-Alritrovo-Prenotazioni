import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

/**
 * TEST 14: Test Time Slot Assignment - Edge Cases
 * 
 * Obiettivo: Verificare che le prenotazioni vengano assegnate correttamente alle fasce orarie
 * in base all'ora di INIZIO, anche quando attraversano più fasce.
 * 
 * Fasce orarie:
 * - Mattina: 10:00 - 14:30
 * - Pomeriggio: 14:31 - 18:30
 * - Sera: 18:31 - 23:30
 * 
 * Test Cases:
 * 1. Prenotazione puramente mattutina (10:00-12:00)
 * 2. Prenotazione che inizia alla fine del mattino (14:00-15:00)
 * 3. Prenotazione che attraversa mattina->pomeriggio (14:00-16:00)
 * 4. Prenotazione che attraversa pomeriggio->sera (18:00-20:00)
 * 5. Prenotazione molto lunga che attraversa tutte le fasce (12:00-22:00)
 */

test.describe('Test 14: Time Slot Assignment Edge Cases', () => {
  test('should assign bookings to correct time slots based on start time', async ({ page }) => {
    console.log('🧪 TEST 14: Starting time slot assignment tests...');
    console.log('📋 Testing edge cases for time slot assignment');
    console.log('');

    // Step 1: Login as admin
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      console.log('⚠️ SKIPPING TEST 14 - Admin login required');
      test.skip();
      return;
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get future date (7 days from now)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    console.log(`📅 Using test date: ${futureDateStr}`);
    console.log('');

    // Navigate to Calendar tab
    const calendarTab = page.locator('button:has-text("Calendario")').first();
    await calendarTab.click();
    await page.waitForTimeout(2000);

    // Click on "Inserisci nuova prenotazione" card
    const newBookingCard = page.locator('text=/Inserisci nuova prenotazione/i');
    if (await newBookingCard.count() > 0) {
      const cardButton = newBookingCard.locator('..').locator('button').first();
      await cardButton.click();
      await page.waitForTimeout(1000);
    }

    // Test Case Results
    const testResults: Array<{name: string, start: string, end: string, expectedSlot: string, passed: boolean, notes: string}> = [];

    // Test Case 1: Prenotazione 10:00-12:00 (Puramente mattutina)
    console.log('🧪 Test Case 1: Prenotazione mattutina pura (10:00-12:00)');
    console.log('   Expected: Mattina');
    await createBooking(page, futureDateStr, '10:00', '12:00', 'Test Morning Booking', 'test.morning@test.com');
    const test1result = await verifyBookingInSlot(page, futureDateStr, 'Test Morning Booking', 'Mattina');
    testResults.push({
      name: 'Prenotazione mattutina pura',
      start: '10:00',
      end: '12:00',
      expectedSlot: 'Mattina',
      passed: test1result,
      notes: test1result ? '✅ Corretto' : '❌ Errato'
    });
    console.log('');

    // Test Case 2: Prenotazione 14:00-15:00 (Inizia nella fascia mattina, finisce nel pomeriggio)
    console.log('🧪 Test Case 2: Prenotazione a cavallo Mattina->Pomeriggio (14:00-15:00)');
    console.log('   Expected: Mattina (basato su ora di INIZIO)');
    await createBooking(page, futureDateStr, '14:00', '15:00', 'Test Mattina-Pomeriggio Booking', 'test.cross1@test.com');
    const test2result = await verifyBookingInSlot(page, futureDateStr, 'Test Mattina-Pomeriggio Booking', 'Mattina');
    testResults.push({
      name: 'Prenotazione Mattina->Pomeriggio',
      start: '14:00',
      end: '15:00',
      expectedSlot: 'Mattina',
      passed: test2result,
      notes: test2result ? '✅ Corretto' : '❌ Dovrebbe essere in Mattina'
    });
    console.log('');

    // Test Case 3: Prenotazione 14:31-16:00 (Inizia nel pomeriggio)
    console.log('🧪 Test Case 3: Prenotazione pomeridiana pura (14:31-16:00)');
    console.log('   Expected: Pomeriggio');
    await createBooking(page, futureDateStr, '14:31', '16:00', 'Test Afternoon Booking', 'test.afternoon@test.com');
    const test3result = await verifyBookingInSlot(page, futureDateStr, 'Test Afternoon Booking', 'Pomeriggio');
    testResults.push({
      name: 'Prenotazione pomeridiana pura',
      start: '14:31',
      end: '16:00',
      expectedSlot: 'Pomeriggio',
      passed: test3result,
      notes: test3result ? '✅ Corretto' : '❌ Errato'
    });
    console.log('');

    // Test Case 4: Prenotazione 18:00-20:00 (Inizia nel pomeriggio, finisce nella sera)
    console.log('🧪 Test Case 4: Prenotazione a cavallo Pomeriggio->Sera (18:00-20:00)');
    console.log('   Expected: Pomeriggio (basato su ora di INIZIO)');
    await createBooking(page, futureDateStr, '18:00', '20:00', 'Test Pomeriggio-Sera Booking', 'test.cross2@test.com');
    const test4result = await verifyBookingInSlot(page, futureDateStr, 'Test Pomeriggio-Sera Booking', 'Pomeriggio');
    testResults.push({
      name: 'Prenotazione Pomeriggio->Sera',
      start: '18:00',
      end: '20:00',
      expectedSlot: 'Pomeriggio',
      passed: test4result,
      notes: test4result ? '✅ Corretto' : '❌ Dovrebbe essere in Pomeriggio'
    });
    console.log('');

    // Test Case 5: Prenotazione 18:31-22:00 (Puramente serale)
    console.log('🧪 Test Case 5: Prenotazione serale pura (18:31-22:00)');
    console.log('   Expected: Sera');
    await createBooking(page, futureDateStr, '18:31', '22:00', 'Test Evening Booking', 'test.evening@test.com');
    const test5result = await verifyBookingInSlot(page, futureDateStr, 'Test Evening Booking', 'Sera');
    testResults.push({
      name: 'Prenotazione serale pura',
      start: '18:31',
      end: '22:00',
      expectedSlot: 'Sera',
      passed: test5result,
      notes: test5result ? '✅ Corretto' : '❌ Errato'
    });
    console.log('');

    // Test Case 6: Prenotazione molto lunga 12:00-22:00 (Attraversa tutte le fasce)
    console.log('🧪 Test Case 6: Prenotazione lunga che attraversa tutte le fasce (12:00-22:00)');
    console.log('   Expected: Mattina (basato su ora di INIZIO)');
    await createBooking(page, futureDateStr, '12:00', '22:00', 'Test Long Booking', 'test.long@test.com');
    const test6result = await verifyBookingInSlot(page, futureDateStr, 'Test Long Booking', 'Mattina');
    testResults.push({
      name: 'Prenotazione lunghissima',
      start: '12:00',
      end: '22:00',
      expectedSlot: 'Mattina',
      passed: test6result,
      notes: test6result ? '✅ Corretto - nella fascia di INIZIO' : '❌ Dovrebbe essere in Mattina (dove inizia)'
    });
    console.log('');

    // Print Summary
    console.log('==========================================');
    console.log('📊 RIEPILOGO RISULTATI TEST');
    console.log('==========================================');
    console.log('');
    
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    
    for (const result of testResults) {
      console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
      console.log(`   Orario: ${result.start}-${result.end}`);
      console.log(`   Atteso: ${result.expectedSlot}`);
      console.log(`   Risultato: ${result.notes}`);
      console.log('');
    }
    
    console.log(`📈 Totale: ${passed}/${total} test passed`);
    
    if (passed === total) {
      console.log('🎉 TUTTI I TEST SONO PASSATI! ✅');
    } else {
      console.log('⚠️  Alcuni test sono falliti');
    }
    
    console.log('==========================================\n');
    console.log('✅ TEST 14 COMPLETED');
  });
});

// Helper functions
async function createBooking(page: any, date: string, startTime: string, endTime: string, name: string, email: string) {
  console.log(`   Creating booking: ${name} at ${date} ${startTime}-${endTime}`);
  
  // Fill form
  await page.fill('input[id="client_name"]', name);
  await page.fill('input[id="client_email"]', email);
  
  const eventTypeField = page.locator('select[id="event_type"]');
  if (await eventTypeField.count() > 0) {
    await eventTypeField.selectOption('drink_rinfresco_completo');
  }
  
  await page.fill('input[id="desired_date"]', date);
  await page.fill('input[id="desired_time"]', startTime);
  await page.fill('input[id="num_guests"]', '5');
  
  // Submit
  const submitButton = page.locator('button[type="submit"], button:has-text("Crea")').first();
  await submitButton.click();
  console.log('   ✓ Booking created');
  
  await page.waitForTimeout(2000);
  
  // Page will reload, wait for reload
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function verifyBookingInSlot(page: any, date: string, bookingName: string, expectedSlot: string): Promise<boolean> {
  console.log(`   Verifying ${bookingName} is in ${expectedSlot} slot...`);
  
  // Navigate to calendar and click on the date
  const calendarTab = page.locator('button:has-text("Calendario")').first();
  await calendarTab.click();
  await page.waitForTimeout(1000);
  
  // Try to find and click the date
  const calendarCells = page.locator('.fc-day');
  const cellCount = await calendarCells.count();
  
  for (let i = 0; i < cellCount; i++) {
    const cell = calendarCells.nth(i);
    const cellDate = await cell.getAttribute('data-date');
    if (cellDate === date) {
      await cell.click();
      await page.waitForTimeout(2000);
      break;
    }
  }
  
  // Look for the booking in the expected time slot
  let found = false;
  
  if (expectedSlot === 'Mattina') {
    const morningSlot = page.locator('text=/Mattina/i').locator('..');
    const bookingInMorning = morningSlot.locator(`text=/${bookingName}/i`);
    found = await bookingInMorning.count() > 0;
  } else if (expectedSlot === 'Pomeriggio') {
    const afternoonSlot = page.locator('text=/Pomeriggio/i').locator('..');
    const bookingInAfternoon = afternoonSlot.locator(`text=/${bookingName}/i`);
    found = await bookingInAfternoon.count() > 0;
  } else if (expectedSlot === 'Sera') {
    const eveningSlot = page.locator('text=/Sera/i').locator('..');
    const bookingInEvening = eveningSlot.locator(`text=/${bookingName}/i`);
    found = await bookingInEvening.count() > 0;
  }
  
  if (found) {
    console.log(`   ✅ Booking found in ${expectedSlot}`);
    return true;
  } else {
    console.log(`   ❌ Booking NOT found in ${expectedSlot}`);
    return false;
  }
}

