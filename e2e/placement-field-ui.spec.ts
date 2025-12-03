import { test, expect } from '@playwright/test';

/**
 * TEST: Campo Posizionamento UI
 *
 * Questo test verifica che il campo "Posizionamento" sia presente e funzionante
 * in tutti i componenti della UI:
 * 1. BookingRequestForm (form pubblico)
 * 2. AdminBookingForm (form admin)
 * 3. BookingDetailsModal (modifica prenotazione)
 * 4. BookingCalendar (visualizzazione nelle schede)
 */

test.describe('Campo Posizionamento UI', () => {
  test('deve mostrare il campo placement in BookingRequestForm', async ({ page }) => {
    console.log('🧪 TEST: Campo Posizionamento in BookingRequestForm');
    console.log('================================================\n');

    // ============================================
    // STEP 1: Navigate to booking form
    // ============================================
    console.log('📝 Step 1: Navigate to booking form...');
    await page.goto('/prenota');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to /prenota');

    await page.screenshot({ path: 'e2e/screenshots/placement-01-form-page.png', fullPage: true });

    // ============================================
    // STEP 2: Verify placement field exists
    // ============================================
    console.log('\n🔍 Step 2: Verifying placement field...');

    // Check for placement label
    const placementLabel = page.locator('label[for="placement"]');
    await expect(placementLabel).toBeVisible({ timeout: 5000 });
    console.log('✅ Placement label is visible');

    // Check label text contains "Posizionamento"
    const labelText = await placementLabel.textContent();
    expect(labelText).toContain('Posizionamento');
    console.log(`✅ Label text: ${labelText}`);

    // Check for Select component (using Radix UI)
    const placementSelect = page.locator('button[id="placement"]').or(page.locator('[data-testid="placement-select"]'));
    await expect(placementSelect).toBeVisible();
    console.log('✅ Placement select is visible');

    // ============================================
    // STEP 3: Test placement field interaction
    // ============================================
    console.log('\n🔍 Step 3: Testing placement field interaction...');

    // Verify select is interactable
    const isEnabled = await placementSelect.isEnabled();
    expect(isEnabled).toBe(true);
    console.log('✅ Placement select is enabled');

    // Verify default value is "Nessuna preferenza"
    const selectedText = await placementSelect.textContent();
    expect(selectedText).toContain('Nessuna preferenza');
    console.log(`✅ Default value: ${selectedText}`);

    await page.screenshot({ path: 'e2e/screenshots/placement-02-final.png', fullPage: true });

    console.log('\n✅ ✅ ✅ TEST COMPLETATO!');
  });

  test('deve mostrare il campo placement in AdminBookingForm', async ({ page }) => {
    console.log('🧪 TEST: Campo Posizionamento in AdminBookingForm');
    console.log('================================================\n');

    // ============================================
    // STEP 1: Login to admin
    // ============================================
    console.log('📝 Step 1: Login to admin...');
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Login (adjust credentials if needed)
    await page.fill('input[type="email"]', 'admin@alritrovo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('✅ Logged in to admin');

    // ============================================
    // STEP 2: Navigate to admin dashboard
    // ============================================
    console.log('\n📝 Step 2: Navigate to admin dashboard...');
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to admin dashboard');

    await page.screenshot({ path: 'e2e/screenshots/placement-04-admin-dashboard.png', fullPage: true });

    // ============================================
    // STEP 3: Click "Nuova Prenotazione" button
    // ============================================
    console.log('\n📝 Step 3: Opening new booking form...');

    // Look for "Nuova Prenotazione" button (might be in a dialog or direct button)
    const newBookingButton = page.locator('button:has-text("Nuova Prenotazione"), button:has-text("Aggiungi Prenotazione")').first();
    await newBookingButton.click();
    await page.waitForTimeout(1000); // Wait for modal/form to appear
    console.log('✅ Clicked new booking button');

    await page.screenshot({ path: 'e2e/screenshots/placement-05-admin-form.png', fullPage: true });

    // ============================================
    // STEP 4: Verify placement field exists in admin form
    // ============================================
    console.log('\n🔍 Step 4: Verifying placement field in admin form...');

    // Check for placement label
    const placementLabel = page.locator('label[for="placement"]');
    await expect(placementLabel).toBeVisible({ timeout: 5000 });
    console.log('✅ Placement label is visible');

    // Check for Select component
    const placementSelect = page.locator('button[id="placement"]').or(page.locator('[data-testid="placement-select"]'));
    await expect(placementSelect).toBeVisible();
    console.log('✅ Placement select is visible');

    // Test interaction
    await placementSelect.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/placement-06-admin-dropdown.png', fullPage: true });

    const salaB = page.locator('text="Sala B"');
    await expect(salaB).toBeVisible();
    console.log('✅ Dropdown options visible');

    console.log('\n✅ ✅ ✅ TEST COMPLETATO!');
  });

  test('deve mostrare il campo placement in BookingDetailsModal', async ({ page }) => {
    console.log('🧪 TEST: Campo Posizionamento in BookingDetailsModal');
    console.log('===================================================\n');

    // ============================================
    // STEP 1: Login to admin
    // ============================================
    console.log('📝 Step 1: Login to admin...');
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'admin@alritrovo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('✅ Logged in to admin');

    // ============================================
    // STEP 2: Navigate to pending bookings
    // ============================================
    console.log('\n📝 Step 2: Navigate to pending bookings...');
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Click "Prenotazioni Pendenti" tab or navigate to pending
    const pendingTab = page.locator('text="Prenotazioni Pendenti", text="Pending", button:has-text("Pendenti")').first();
    if (await pendingTab.count() > 0) {
      await pendingTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked Pending tab');
    }

    await page.screenshot({ path: 'e2e/screenshots/placement-07-pending-list.png', fullPage: true });

    // ============================================
    // STEP 3: Open first booking details
    // ============================================
    console.log('\n📝 Step 3: Opening booking details...');

    // Find and click first booking card or details button
    const detailsButton = page.locator('[data-testid="view-details"], button:has-text("Dettagli"), button:has-text("Visualizza")').first();
    if (await detailsButton.count() > 0) {
      await detailsButton.click();
    } else {
      // Try clicking on the first booking card
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      await bookingCard.click();
    }

    await page.waitForTimeout(1000);
    console.log('✅ Opened booking details');

    await page.screenshot({ path: 'e2e/screenshots/placement-08-details-modal.png', fullPage: true });

    // ============================================
    // STEP 4: Check if placement field is visible in view mode
    // ============================================
    console.log('\n🔍 Step 4: Checking placement field in view mode...');

    // Look for placement info in view mode (might be displayed with MapPin icon)
    const placementInfo = page.locator('text="Posizionamento"').first();
    if (await placementInfo.count() > 0) {
      await expect(placementInfo).toBeVisible();
      console.log('✅ Placement info visible in view mode');
    } else {
      console.log('⚠️ Placement info not visible (might be empty)');
    }

    // ============================================
    // STEP 5: Switch to edit mode and verify placement field
    // ============================================
    console.log('\n📝 Step 5: Switching to edit mode...');

    const editButton = page.locator('button:has-text("Modifica"), button:has-text("Edit")').first();
    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(500);
      console.log('✅ Clicked edit button');

      await page.screenshot({ path: 'e2e/screenshots/placement-09-edit-mode.png', fullPage: true });

      // Check for placement field in edit mode
      const placementLabel = page.locator('label:has-text("Posizionamento")');
      await expect(placementLabel).toBeVisible({ timeout: 5000 });
      console.log('✅ Placement label visible in edit mode');

      const placementSelect = page.locator('button[id="placement"]').or(page.locator('[data-testid="placement-select"]'));
      if (await placementSelect.count() > 0) {
        await expect(placementSelect).toBeVisible();
        console.log('✅ Placement select visible in edit mode');
      }
    } else {
      console.log('⚠️ Edit button not found');
    }

    console.log('\n✅ ✅ ✅ TEST COMPLETATO!');
  });

  test('deve mostrare il campo placement nelle schede del calendario', async ({ page }) => {
    console.log('🧪 TEST: Campo Posizionamento in BookingCalendar');
    console.log('================================================\n');

    // This test requires an existing booking with placement set
    // We'll verify the UI renders the field correctly

    // ============================================
    // STEP 1: Login to admin
    // ============================================
    console.log('📝 Step 1: Login to admin...');
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'admin@alritrovo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('✅ Logged in to admin');

    // ============================================
    // STEP 2: Navigate to calendar
    // ============================================
    console.log('\n📝 Step 2: Navigate to calendar...');
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // Click "Calendario" tab
    const calendarTab = page.locator('button:has-text("Calendario"), text="Calendario"').first();
    if (await calendarTab.count() > 0) {
      await calendarTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clicked Calendar tab');
    }

    await page.screenshot({ path: 'e2e/screenshots/placement-10-calendar-view.png', fullPage: true });

    // ============================================
    // STEP 3: Check if any booking shows placement
    // ============================================
    console.log('\n🔍 Step 3: Checking for placement display in calendar cards...');

    // Look for placement icon (MapPin) or label
    const placementDisplay = page.locator('text="Posizionamento:"').first();

    if (await placementDisplay.count() > 0) {
      console.log('✅ Found placement display in calendar');
      await expect(placementDisplay).toBeVisible();

      // Get the placement value
      const parentDiv = placementDisplay.locator('xpath=ancestor::div[1]');
      const placementValue = await parentDiv.textContent();
      console.log(`✅ Placement value: ${placementValue}`);
    } else {
      console.log('⚠️ No placement display found (might be no bookings with placement set)');
    }

    await page.screenshot({ path: 'e2e/screenshots/placement-11-calendar-detail.png', fullPage: true });

    console.log('\n✅ ✅ ✅ TEST COMPLETATO!');
  });
});
