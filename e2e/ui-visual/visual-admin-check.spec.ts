import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Visual Check', () => {
  test('Login and verify all rounded-2xl styles are applied', async ({ page }) => {
    // Step 1: Login
    console.log('🔐 Step 1: Logging in...')
    await page.goto('http://localhost:5178/login')
    await page.waitForLoadState('networkidle')

    // Fill login form with real credentials
    await page.fill('input[type="email"]', '0cavuz0@gmail.com')
    await page.fill('input[type="password"]', 'Cavallaro')
    await page.click('button[type="submit"]')

    // Wait for redirect to /admin
    await page.waitForURL('**/admin', { timeout: 10000 })
    await page.waitForTimeout(2000)

    console.log('✅ Login successful')

    // Step 2: Take full screenshot
    await page.screenshot({ path: 'screenshots/admin-dashboard-full.png', fullPage: true })

    // Step 3: Count rounded-2xl elements
    const rounded = page.locator('.rounded-2xl')
    const roundedCount = await rounded.count()
    console.log(`\n📐 Total rounded-2xl elements: ${roundedCount}`)
    expect(roundedCount).toBeGreaterThan(5) // Should have many rounded elements

    // Step 4: Check Stats Cards
    console.log('\n📊 Checking Stats Cards...')
    const statsCards = page.locator('div.bg-white.rounded-2xl.border.border-gray-300.shadow-md').filter({ hasText: /Settimana|Oggi|Mese|Rifiutate/ })
    const statsCount = await statsCards.count()
    console.log(`   Found ${statsCount} stats cards`)
    expect(statsCount).toBe(4) // Should have 4 stats cards

    // Check first stats card dimensions and styles
    if (statsCount > 0) {
      const firstCard = statsCards.first()
      const box = await firstCard.boundingBox()
      const classes = await firstCard.getAttribute('class')
      console.log(`   Stats card classes: ${classes}`)
      if (box) {
        console.log(`   Stats card size: ${box.width}px × ${box.height}px`)
      }
    }

    // Step 5: Check Navigation Buttons
    console.log('\n🧭 Checking Navigation Buttons...')
    const navButtons = page.locator('nav button.bg-white.rounded-2xl.border')
    const navCount = await navButtons.count()
    console.log(`   Found ${navCount} navigation buttons`)
    expect(navCount).toBeGreaterThan(0)

    if (navCount > 0) {
      const firstNav = navButtons.first()
      const box = await firstNav.boundingBox()
      const classes = await firstNav.getAttribute('class')
      console.log(`   Nav button classes: ${classes}`)
      if (box) {
        console.log(`   Nav button size: ${box.width}px × ${box.height}px`)
        // Should be LARGE (doppia dimensione)
        expect(box.height).toBeGreaterThan(60) // At least 60px tall
      }
    }

    // Step 6: Check User Info Box
    console.log('\n👤 Checking User Info Box...')
    const userBox = page.locator('div.bg-white.rounded-2xl.border.border-gray-300').filter({ hasText: /Amministratore|Staff/ })
    const userCount = await userBox.count()
    console.log(`   Found ${userCount} user info boxes`)

    // Step 7: Check Logout Button
    console.log('\n🚪 Checking Logout Button...')
    const logoutBtn = page.locator('button.bg-white.rounded-2xl').filter({ hasText: /Logout/i })
    const logoutCount = await logoutBtn.count()
    console.log(`   Found ${logoutCount} logout buttons`)

    // Step 8: Check CollapsibleCard
    console.log('\n📦 Checking CollapsibleCard...')
    const collapseCards = page.locator('div.rounded-2xl.border.border-gray-300.shadow-md').filter({ hasText: /Inserisci|Pendenti/i })
    const collapseCount = await collapseCards.count()
    console.log(`   Found ${collapseCount} collapsible cards`)

    // Step 9: Navigate to Archive tab
    console.log('\n🗃️ Checking Archive Tab...')
    await page.click('text=Archivio')
    await page.waitForTimeout(1500)

    // Check filter container
    const filterContainer = page.locator('div.bg-white.rounded-2xl.border.border-gray-300').filter({ hasText: /Filtra per Status/i })
    const filterCount = await filterContainer.count()
    console.log(`   Found ${filterCount} filter containers`)

    // Check filter buttons
    const filterButtons = page.locator('button.rounded-2xl.border').filter({ hasText: /Tutte|Accettate|Rifiutate/ })
    const filterBtnCount = await filterButtons.count()
    console.log(`   Found ${filterBtnCount} filter buttons`)

    await page.screenshot({ path: 'screenshots/admin-archive-tab.png', fullPage: true })

    // Final summary
    console.log('\n✅ SUMMARY:')
    console.log(`   - Total rounded-2xl elements: ${roundedCount}`)
    console.log(`   - Stats cards: ${statsCount}`)
    console.log(`   - Navigation buttons: ${navCount}`)
    console.log(`   - User info boxes: ${userCount}`)
    console.log(`   - Logout buttons: ${logoutCount}`)
    console.log(`   - Collapsible cards: ${collapseCount}`)
    console.log(`   - Filter containers: ${filterCount}`)
    console.log(`   - Filter buttons: ${filterBtnCount}`)
  })
})

