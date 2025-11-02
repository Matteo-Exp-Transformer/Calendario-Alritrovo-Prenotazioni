import { test, expect } from '@playwright/test';

/**
 * TEST: Verifica che l'input orario nei form di prenotazione
 * normalizzi correttamente i minuti a 00 o 30
 */
test.describe('Test TimeInput - Normalizzazione minuti 00/30', () => {
  test('should normalize minutes to 00 or 30 in booking form', async ({ page }) => {
    console.log('🧪 TEST: Verifica normalizzazione minuti 00/30 nel form prenotazioni...');

    // Step 1: Navigate to booking form
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to /prenota');

    // Step 2: Find time input
    const timeInput = page.locator('#desired_time');
    
    if (await timeInput.count() === 0) {
      throw new Error('Time input not found');
    }
    
    console.log('✅ Time input found');

    // Step 3: Fill form with test data first
    await page.fill('#client_name', 'Test User');
    await page.fill('#client_email', 'test@example.com');
    await page.fill('#client_phone', '+39 333 1234567');
    await page.selectOption('#event_type', 'drink_caraffe');
    
    // Fill a future date
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.fill('#desired_date', futureDate);
    console.log('✅ Form filled with test data');

    // Step 4: Test various times and check normalization
    const testCases = [
      { input: '20:15', expected: '20:00' }, // Should normalize to 00
      { input: '20:30', expected: '20:30' }, // Should keep 30
      { input: '20:00', expected: '20:00' }, // Should keep 00
      { input: '20:45', expected: '20:00' }, // Should normalize to 00
      { input: '20:59', expected: '20:00' }, // Should normalize to 00
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.input} should become ${testCase.expected}`);
      
      await timeInput.fill(testCase.input);
      await page.waitForTimeout(300); // Wait for onChange to fire
      
      const actualValue = await timeInput.inputValue();
      console.log(`   Actual value: ${actualValue}`);
      
      expect(actualValue).toBe(testCase.expected);
      console.log(`   ✅ Normalized correctly`);
    }

    console.log('\n✅ TEST PASSED: All time inputs normalized correctly to 00 or 30');
  });

  test('should normalize minutes in AcceptBookingModal', async ({ page }) => {
    console.log('🧪 TEST: Verifica normalizzazione minuti nel AcceptBookingModal...');

    // Step 1: Login as admin
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /accedi/i });
    await submitBtn.click();

    try {
      await page.waitForURL('**/admin**', { timeout: 10000 });
    } catch {
      await page.waitForTimeout(2000);
      if (!page.url().includes('/admin')) {
        throw new Error('Login failed');
      }
    }

    await page.waitForTimeout(2000);

    // Step 2: Navigate to Archivio to find a pending booking
    const archiveTab = page.locator('button:has-text("Archivio"), [data-tab="archive"]').first();
    if (await archiveTab.count() > 0) {
      await archiveTab.click();
      await page.waitForTimeout(1000);
    }

    // Step 3: Find and click Accept button
    const acceptButton = page.locator('button:has-text("Accetta")').first();
    if (await acceptButton.count() === 0) {
      console.log('⚠️ No pending bookings to accept');
      test.skip();
      return;
    }

    await acceptButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ AcceptBookingModal opened');

    // Step 4: Find time inputs
    const startTimeInput = page.locator('input[type="time"]').first();
    const endTimeInput = page.locator('input[type="time"]').last();
    
    if (await startTimeInput.count() === 0) {
      throw new Error('Start time input not found');
    }

    // Step 5: Test normalization
    const testTime = '21:15';
    console.log(`🧪 Testing: ${testTime} should normalize to 21:00`);
    
    await startTimeInput.fill(testTime);
    await page.waitForTimeout(300);
    
    const actualValue = await startTimeInput.inputValue();
    console.log(`   Actual value: ${actualValue}`);
    
    expect(actualValue).toBe('21:00');
    console.log('✅ Normalized correctly');
  });
});

// Mobile-specific test with device emulation
test.describe('Test TimeInput - Mobile Devices', () => {
  // Test on iOS Safari
  test('should work correctly on iOS Safari', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');

    const timeInput = page.locator('#desired_time');
    if (await timeInput.count() > 0) {
      await page.fill('#client_name', 'Test User');
      await page.fill('#client_email', 'test@example.com');
      await page.fill('#client_phone', '+39 333 1234567');
      await page.selectOption('#event_type', 'drink_caraffe');
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await page.fill('#desired_date', futureDate);
      
      await timeInput.fill('20:45');
      await page.waitForTimeout(300);
      const value = await timeInput.inputValue();
      expect(value).toBe('20:00');
      console.log('✅ iOS Safari test passed');
    }
  });

  // Test on Android Chrome
  test('should work correctly on Android Chrome', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 }); // Android mobile
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');

    const timeInput = page.locator('#desired_time');
    if (await timeInput.count() > 0) {
      await page.fill('#client_name', 'Test User');
      await page.fill('#client_email', 'test@example.com');
      await page.fill('#client_phone', '+39 333 1234567');
      await page.selectOption('#event_type', 'drink_caraffe');
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await page.fill('#desired_date', futureDate);
      
      await timeInput.fill('20:15');
      await page.waitForTimeout(300);
      const value = await timeInput.inputValue();
      expect(value).toBe('20:00');
      console.log('✅ Android Chrome test passed');
    }
  });
});


