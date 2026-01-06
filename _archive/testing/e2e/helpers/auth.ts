import { Page } from '@playwright/test';

/**
 * Helper function to login as admin
 * Returns true if login successful, false otherwise
 */
export async function loginAsAdmin(page: Page): Promise<boolean> {
  console.log('🔑 Attempting admin login...');

  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  console.log('✅ Navigated to /login');

  // Fill login form with correct ID selectors
  await page.fill('#email', '0cavuz0@gmail.com');
  await page.fill('#password', 'Cavallaro');
  console.log('📝 Login credentials filled');

  // Submit login
  const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i });
  await submitButton.click();
  console.log('🔑 Login form submitted');

  // Wait for response
  await page.waitForTimeout(3000);

  // Check if redirected to /admin
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);

  if (!currentUrl.includes('/admin')) {
    console.log('⚠️ Login failed - admin user might not exist in database');
    console.log('⚠️ Please create admin user in Supabase: admin@alritrovo.com / admin123');
    return false;
  }

  console.log('✅ Logged in successfully and redirected to /admin');
  return true;
}
