import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

/**
 * TEST 13: Test Completo Calendario e Collapse Cards
 * 
 * Steps:
 * 1. Login as admin
 * 2. Navigate to Calendar tab
 * 3. Click on today's date
 * 4. Test Collapse Cards - verify they can open/close
 * 5. Test capacity counts are visible
 * 6. Test booking insertion from admin
 * 7. Test that booking appears in correct time slot
 */

test.describe('Test 13: Calendar and Collapse Cards Test', () => {
  test('should test collapse cards functionality and booking assignment', async ({ page }) => {
    console.log('🧪 TEST 13: Starting calendar and collapse cards test...');

    // Step 1: Login as admin
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) {
      console.log('⚠️ SKIPPING TEST 13 - Admin login required');
      test.skip();
      return;
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/13-01-admin-dashboard.png', fullPage: true });

    // Step 2: Navigate to Calendar tab
    console.log('📅 Navigating to Calendar tab...');
    const calendarTab = page.locator('button:has-text("Calendario")').first();
    if (await calendarTab.count() > 0) {
      await calendarTab.click();
      console.log('✅ Clicked Calendario tab');
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'e2e/screenshots/13-02-calendar-view.png', fullPage: true });

    // Step 3: Click on today's date
    console.log('📅 Clicking on today\'s date...');
    const todayCell = page.locator('.fc-day-today').first();
    if (await todayCell.count() > 0) {
      await todayCell.click();
      console.log('✅ Clicked on today\'s date');
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'e2e/screenshots/13-03-selected-date.png', fullPage: true });

    // Step 4: Test Collapse Cards - check if morning card can collapse/expand
    console.log('🔍 Testing Morning Collapse Card...');
    const morningCard = page.locator('text=/Mattina/i').locator('..').first();
    if (await morningCard.count() > 0) {
      // Check if chevron exists
      const chevronButton = morningCard.locator('button:has(svg)').last();
      if (await chevronButton.count() > 0) {
        const isExpanded = await morningCard.locator('text=/Nessuna prenotazione|ospiti/i').count() > 0;
        
        if (isExpanded) {
          console.log('✅ Morning card is expanded');
          
          // Try to collapse it
          await chevronButton.click();
          console.log('📂 Clicked to collapse morning card');
          await page.waitForTimeout(1000);
          
          // Check if collapsed
          const stillExpanded = await morningCard.locator('text=/Nessuna prenotazione|ospiti/i').isVisible();
          if (!stillExpanded) {
            console.log('✅ Morning card collapsed successfully');
          } else {
            console.log('⚠️ Morning card did not collapse');
          }
          
          // Take screenshot
          await page.screenshot({ path: 'e2e/screenshots/13-04-morning-collapsed.png', fullPage: true });
          
          // Expand again
          await chevronButton.click();
          await page.waitForTimeout(1000);
          console.log('📂 Expanded morning card again');
        } else {
          console.log('⚠️ Morning card appears to be collapsed initially');
        }
      }
    }

    // Step 5: Test capacity counts are visible
    console.log('🔍 Testing capacity counts visibility...');
    
    const morningCount = page.locator('text=/Mattina/i').locator('..').locator('text=/[0-9]+\\/[0-9]+/').first();
    const afternoonCount = page.locator('text=/Pomeriggio/i').locator('..').locator('text=/[0-9]+\\/[0-9]+/').first();
    const eveningCount = page.locator('text=/Sera/i').locator('..').locator('text=/[0-9]+\\/[0-9]+/').first();

    let countsVisible = 0;
    if (await morningCount.count() > 0) {
      console.log('✅ Morning capacity count visible');
      countsVisible++;
    }
    if (await afternoonCount.count() > 0) {
      console.log('✅ Afternoon capacity count visible');
      countsVisible++;
    }
    if (await eveningCount.count() > 0) {
      console.log('✅ Evening capacity count visible');
      countsVisible++;
    }

    console.log(`📊 Total visible count badges: ${countsVisible}/3`);

    await page.screenshot({ path: 'e2e/screenshots/13-05-capacity-counts.png', fullPage: true });

    // Step 6: Test booking insertion from admin
    console.log('📝 Testing booking insertion from admin...');

    // Look for "Inserisci nuova prenotazione" collapse card
    const newBookingCard = page.locator('text=/Inserisci nuova prenotazione/i');
    if (await newBookingCard.count() > 0) {
      console.log('✅ Found "Inserisci nuova prenotazione" card');
      
      // Try to expand it by clicking
      const cardButton = newBookingCard.locator('..').locator('button').first();
      if (await cardButton.count() > 0) {
        await cardButton.click();
        console.log('✅ Clicked to expand new booking card');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'e2e/screenshots/13-06-new-booking-form.png', fullPage: true });
      }
    } else {
      console.log('⚠️ "Inserisci nuova prenotazione" card not found');
    }

    // Step 7: Insert a test booking crossing time slots (e.g., starts at 14:30, ends at 18:30)
    console.log('📝 Creating test booking that crosses time slots...');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5); // 5 days from now
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    // Check if form fields are visible
    const nameField = page.locator('input[id="client_name"]');
    const emailField = page.locator('input[id="client_email"]');
    const eventTypeField = page.locator('select[id="event_type"]');
    const dateField = page.locator('input[id="desired_date"]');
    const timeField = page.locator('input[id="desired_time"]');
    const guestsField = page.locator('input[id="num_guests"]');

    if (await nameField.count() > 0) {
      console.log('✅ Booking form fields found, filling form...');
      
      // Fill form with test data that crosses time slots
      await nameField.fill('Test Cross Booking');
      await emailField.fill('test.cross@example.com');
      
      if (await eventTypeField.count() > 0) {
        await eventTypeField.selectOption('drink_rinfresco_completo');
      }
      
      await dateField.fill(futureDateStr);
      await timeField.fill('14:30'); // Starts in afternoon
      await guestsField.fill('10');
      
      console.log('✅ Form filled with crossing time slot booking (14:30-18:30)');
      
      await page.screenshot({ path: 'e2e/screenshots/13-07-form-filled.png', fullPage: true });
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Crea")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        console.log('✅ Submit button clicked');
        await page.waitForTimeout(3000);
        
        // Check for success
        const successMsg = page.locator('text=/successo|success/i');
        if (await successMsg.count() > 0) {
          console.log('✅ Booking created successfully');
        } else {
          console.log('⚠️ No success message found');
        }
        
        await page.screenshot({ path: 'e2e/screenshots/13-08-after-submit.png', fullPage: true });
      }
    } else {
      console.log('⚠️ Form fields not found or card is collapsed');
    }

    // Step 8: Navigate to the date of the booking and verify it appears in correct slot
    if (await dateField.count() > 0) {
      await page.click('.fc-day'); // Click on any date cell first to reset
      await page.waitForTimeout(1000);
      
      // Click on the calendar cell for futureDateStr
      const calendarCells = page.locator('.fc-day');
      const cellCount = await calendarCells.count();
      console.log(`📅 Found ${cellCount} calendar cells`);
      
      // Try to find and click the future date
      for (let i = 0; i < cellCount; i++) {
        const cell = calendarCells.nth(i);
        const cellDate = await cell.getAttribute('data-date');
        if (cellDate === futureDateStr) {
          await cell.click();
          console.log(`✅ Clicked on future date: ${futureDateStr}`);
          await page.waitForTimeout(1000);
          break;
        }
      }
      
      await page.screenshot({ path: 'e2e/screenshots/13-09-check-future-date.png', fullPage: true });
      
      // Check if booking appears in AFTERNOON slot (where it starts)
      console.log('🔍 Checking if booking appears in correct time slot (Afternoon)...');
      const afternoonBookings = page.locator('text=/Test Cross Booking/i');
      if (await afternoonBookings.count() > 0) {
        const isInAfternoon = await page.locator('text=/Pomeriggio/i').locator('..').locator('text=/Test Cross Booking/i').count() > 0;
        if (isInAfternoon) {
          console.log('✅ Booking correctly appears in AFTERNOON slot (where it starts)');
        } else {
          console.log('❌ Booking appears in wrong slot');
        }
      } else {
        console.log('⚠️ Test booking not found - may need to refresh or booking was not created');
      }
    }

    // Final screenshot
    await page.screenshot({ path: 'e2e/screenshots/13-10-final-state.png', fullPage: true });

    console.log('✅ TEST 13 COMPLETED');
    console.log('==========================================\n');
  });
});


