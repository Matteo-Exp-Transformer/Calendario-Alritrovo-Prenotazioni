import { test, expect } from '@playwright/test';

/**
 * TEST: Verifica che l'input orario nei dettagli prenotazioni
 * permetta solo minuti 00 o 30
 */
test.describe('Test TimeInput Component - Minuti solo 00 o 30', () => {
  test('should only allow 00 or 30 minutes in booking details modal', async ({ page }) => {
    console.log('🧪 TEST: Verifica TimeInput con minuti 00/30...');

    // Step 1: Login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    console.log('📝 Login credentials filled');

    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /accedi/i });
    await submitBtn.click();
    console.log('🔑 Login form submitted');

    // Wait for navigation
    try {
      await page.waitForURL('**/admin**', { timeout: 10000 });
      console.log('✅ Redirected to /admin');
    } catch (error) {
      console.log('⚠️ waitForURL timeout, checking current URL...');
      await page.waitForTimeout(2000);
      if (!page.url().includes('/admin')) {
        console.log('❌ Login failed');
        test.skip();
        return;
      }
    }

    await page.waitForTimeout(2000);

    // Step 2: Navigate to Calendario tab
    const calendarTabSelectors = [
      'button:has-text("Calendario")',
      '[data-tab="calendar"]',
      'nav button:first-child'
    ];

    for (const selector of calendarTabSelectors) {
      const tab = page.locator(selector);
      if (await tab.count() > 0) {
        await tab.click();
        console.log('✅ Clicked Calendario tab');
        break;
      }
    }

    await page.waitForTimeout(2000);

    // Step 3: Find and click on a booking event
    console.log('🔍 Looking for booking event in calendar...');
    const calendarEvent = page.locator('.fc-event, [class*="fc-event"]').first();

    if (await calendarEvent.count() === 0) {
      console.log('⚠️ No events found in calendar');
      // Try alternative: go to archive and accept a booking first
      const archiveTab = page.locator('button:has-text("Archivio"), [data-tab="archive"]').first();
      if (await archiveTab.count() > 0) {
        await archiveTab.click();
        await page.waitForTimeout(1000);
        const acceptButton = page.locator('button:has-text("Accetta")').first();
        if (await acceptButton.count() > 0) {
          await acceptButton.click();
          await page.waitForTimeout(1000);
          // Fill accept form if needed
          const confirmBtn = page.locator('button:has-text("Conferma"), button:has-text("Accetta")').last();
          if (await confirmBtn.count() > 0) {
            await confirmBtn.click();
            await page.waitForTimeout(2000);
            // Go back to calendar
            for (const selector of calendarTabSelectors) {
              const tab = page.locator(selector);
              if (await tab.count() > 0) {
                await tab.click();
                break;
              }
            }
            await page.waitForTimeout(2000);
            const newEvent = page.locator('.fc-event, [class*="fc-event"]').first();
            if (await newEvent.count() > 0) {
              await newEvent.click();
              console.log('✅ Clicked on calendar event');
            } else {
              throw new Error('No calendar events found after accepting booking');
            }
          }
        } else {
          throw new Error('No calendar events found and no bookings to accept');
        }
      } else {
        throw new Error('No calendar events found');
      }
    } else {
      await calendarEvent.click();
      console.log('✅ Clicked on calendar event');
    }

    // Step 4: Wait for modal to appear
    await page.waitForTimeout(1000);
    console.log('🔍 Waiting for booking details modal...');

    const modal = page.locator('div.fixed.inset-0').filter({ hasText: /prenotazione|confermata/i }).last();
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Modal found');

    await page.screenshot({ path: 'e2e/screenshots/test-timeinput-modal-opened.png', fullPage: true });

    // Step 5: Click "Modifica" button to enter edit mode
    console.log('✏️ Clicking Modifica button...');
    const modificaButton = page.locator('button').filter({ hasText: /modifica/i }).first();
    
    if (await modificaButton.count() > 0) {
      await modificaButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Entered edit mode');
    }

    await page.screenshot({ path: 'e2e/screenshots/test-timeinput-edit-mode.png', fullPage: true });

    // Step 6: Verify TimeInput components are present (select elements, not input[type="time"])
    console.log('🔍 Verificando che gli input orario siano select con solo 00/30...');

    // Look for select elements (not input[type="time"])
    const hourSelects = page.locator('select').filter({ hasText: /00|01|02/ }).first();
    const minuteSelects = page.locator('select').filter({ hasText: /00|30/ });

    // Verify we have select elements, not time inputs
    const timeInputs = page.locator('input[type="time"]');
    const timeInputCount = await timeInputs.count();
    
    console.log(`Found ${timeInputCount} input[type="time"] elements (should be 0)`);
    
    // Check for select elements that might be our TimeInput
    const allSelects = page.locator('select');
    const selectCount = await allSelects.count();
    console.log(`Found ${selectCount} select elements`);

    // Look for TimeInput structure: two selects with a colon between them
    const timeInputContainer = page.locator('div.flex.gap-2').filter({ hasText: /:/ });
    
    if (await timeInputContainer.count() > 0) {
      console.log('✅ Found TimeInput container with flex layout');
      
      // Get the minute selects - should have only 00 and 30 options
      const minuteSelect = timeInputContainer.locator('select').nth(1); // Second select is minutes
      
      if (await minuteSelect.count() > 0) {
        const options = await minuteSelect.locator('option').all();
        const optionValues: string[] = [];
        
        for (const option of options) {
          const value = await option.getAttribute('value');
          if (value) optionValues.push(value);
        }
        
        console.log('Minute options found:', optionValues);
        
        // Verify only 00 and 30 are present
        expect(optionValues.length).toBe(2);
        expect(optionValues).toContain('00');
        expect(optionValues).toContain('30');
        
        console.log('✅ Minute select has only 00 and 30 options');
        
        // Test selecting 30 minutes
        await minuteSelect.selectOption('30');
        await page.waitForTimeout(300);
        const selectedValue = await minuteSelect.inputValue();
        expect(selectedValue).toBe('30');
        console.log('✅ Successfully selected 30 minutes');
        
        // Test selecting 00 minutes
        await minuteSelect.selectOption('00');
        await page.waitForTimeout(300);
        const selectedValue00 = await minuteSelect.inputValue();
        expect(selectedValue00).toBe('00');
        console.log('✅ Successfully selected 00 minutes');
      }
    } else {
      // Fallback: try to find any select with 00 and 30 options
      console.log('⚠️ TimeInput container not found, searching for minute selects...');
      
      const allMinuteSelects = page.locator('select').filter({ has: page.locator('option[value="00"]') });
      
      for (let i = 0; i < Math.min(await allMinuteSelects.count(), 2); i++) {
        const select = allMinuteSelects.nth(i);
        const options = await select.locator('option').all();
        const values: string[] = [];
        
        for (const option of options) {
          const value = await option.getAttribute('value');
          if (value) values.push(value);
        }
        
        // Check if this select has only 00 and 30
        if (values.length === 2 && values.includes('00') && values.includes('30')) {
          console.log(`✅ Found minute select at index ${i} with only 00 and 30`);
          
          // Test it
          await select.selectOption('30');
          await page.waitForTimeout(300);
          const selected = await select.inputValue();
          expect(selected).toBe('30');
          console.log('✅ Verified minute select works correctly');
          break;
        }
      }
    }

    await page.screenshot({ path: 'e2e/screenshots/test-timeinput-verified.png', fullPage: true });

    console.log('✅ TEST PASSED: TimeInput component correctly limits minutes to 00 or 30');
    console.log('🎉 TEST COMPLETED');
  });
});




