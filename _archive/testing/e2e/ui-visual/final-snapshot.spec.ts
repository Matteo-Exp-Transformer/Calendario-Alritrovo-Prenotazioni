import { test } from '@playwright/test'

test('Final snapshot - Verify rounded borders and styling', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5179/login')
  await page.fill('input[type="email"]', '0cavuz0@gmail.com')
  await page.fill('input[type="password"]', 'Cavallaro')
  await page.click('button[type="submit"]')

  // Wait for dashboard
  await page.waitForURL('**/admin')
  await page.waitForTimeout(2000)

  // Take full page screenshot
  await page.screenshot({ path: 'screenshots/FINAL-dashboard.png', fullPage: true })

  console.log('✅ Screenshot saved to screenshots/FINAL-dashboard.png')
  console.log('📍 Check for:')
  console.log('   - Stats cards with rounded-3xl borders (more rounded)')
  console.log('   - Navigation buttons with rounded-3xl borders (more rounded)')
  console.log('   - Thick borders (border-2) visible in gray-400')
  console.log('   - User info box with rounded-3xl')
  console.log('   - Logout button with rounded-3xl')

  // Navigate to Archive tab
  await page.click('text=Archivio')
  await page.waitForTimeout(1500)

  // Take archive screenshot
  await page.screenshot({ path: 'screenshots/FINAL-archive.png', fullPage: true })

  console.log('✅ Archive screenshot saved to screenshots/FINAL-archive.png')
  console.log('📍 Check for:')
  console.log('   - Filter container with rounded-3xl')
  console.log('   - Filter buttons with rounded-3xl')
  console.log('   - Archive cards with rounded-3xl')
})

