import { test, expect } from '@playwright/test';

test.describe('Placement Dropdown Styling Verification', () => {
  test('verify placement dropdown has white background and correct z-index', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5174/login');

    // Login as admin
    await page.fill('#email', '0cavuz0@gmail.com');
    await page.fill('#password', 'Cavallaro');
    await page.click('button[type="submit"]');

    // Wait for navigation to admin dashboard
    await page.waitForURL('**/admin');
    await expect(page).toHaveURL(/\/admin/);

    // Take screenshot of logged in state
    await page.screenshot({
      path: 'e2e/screenshots/placement-dropdown-01-admin-dashboard.png',
      fullPage: true
    });

    // Click "Inserisci nuova prenotazione" to open the new booking form
    // This will show us the placement dropdown in edit mode
    await page.click('button:has-text("Inserisci nuova prenotazione"), summary:has-text("Inserisci nuova prenotazione")');
    await page.waitForTimeout(1000);

    // Wait for the form to expand/appear
    await page.waitForSelector('input[placeholder*="Nome"], input[id="nome"]', { timeout: 5000 });

    // Take screenshot of form opened
    await page.screenshot({
      path: 'e2e/screenshots/placement-dropdown-02-form-opened.png',
      fullPage: true
    });

    // Find and click the placement dropdown trigger
    // Look for the Select component with placeholder "Seleziona posizionamento"
    const placementTrigger = page.locator('button[role="combobox"]').filter({ hasText: /Posizionamento|Seleziona posizionamento|Interno|Esterno|Dehors/ });
    await placementTrigger.click();

    // Wait for dropdown to open
    await page.waitForTimeout(300);

    // Verify dropdown is visible
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Take screenshot with dropdown open
    await page.screenshot({
      path: 'e2e/screenshots/placement-dropdown-04-dropdown-open.png',
      fullPage: true
    });

    // Verify dropdown styling
    const dropdownBg = await dropdown.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        zIndex: styles.zIndex,
        position: styles.position,
      };
    });

    console.log('Dropdown styles:', dropdownBg);

    // Check if background color is white or near white
    // RGB white is rgb(255, 255, 255)
    const isWhiteBackground = dropdownBg.backgroundColor.includes('255, 255, 255') ||
                              dropdownBg.backgroundColor.includes('rgb(255, 255, 255)');

    console.log('Is white background:', isWhiteBackground);
    console.log('Background color:', dropdownBg.backgroundColor);

    // Verify z-index is high enough (should be > 50 for modals)
    const zIndexValue = parseInt(dropdownBg.zIndex);
    console.log('Z-index value:', zIndexValue);

    // Take final screenshot
    await page.screenshot({
      path: 'e2e/screenshots/placement-dropdown-05-final-verification.png',
      fullPage: true
    });

    // Log results
    console.log('\n=== VERIFICATION RESULTS ===');
    console.log('Background Color:', dropdownBg.backgroundColor);
    console.log('Is White:', isWhiteBackground);
    console.log('Z-Index:', dropdownBg.zIndex);
    console.log('Position:', dropdownBg.position);
    console.log('===========================\n');

    // Assertions
    expect(isWhiteBackground, 'Dropdown should have white background').toBe(true);
    expect(zIndexValue, 'Dropdown z-index should be greater than 50').toBeGreaterThan(50);
  });
});
