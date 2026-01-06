import { test, expect } from '@playwright/test'

test('FINAL Verification - No Duplicate Menu Items', async ({ page }) => {
  console.log('🎯 FINAL VERIFICATION: Checking for duplicate menu items')

  // Navigate to prenota page (update port if needed)
  await page.goto('http://localhost:5176/prenota')
  await page.waitForLoadState('networkidle')

  // Fill required fields to trigger menu display
  await page.fill('input[id="client_name"]', 'Final Verification Test')
  await page.fill('input[id="client_phone"]', '351 999 8888')

  // Fill date and time
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split('T')[0]
  await page.fill('#desired_date', dateStr)
  await page.fill('#desired_time', '12:00')

  // Fill num_guests
  await page.fill('#num_guests', '50')

  // Select Rinfresco di Laurea to show menu (use select dropdown)
  await page.selectOption('#booking_type', 'rinfresco_laurea')
  await page.waitForTimeout(3000)

  console.log('📋 Counting items in each category...')

  // Count items in Bevande
  const bevandeSection = page.locator('div.space-y-4:has(h3:has-text("Bevande"))')
  const bevandeItems = await bevandeSection.locator('label.flex.items-start').count()
  console.log(`   Bevande: ${bevandeItems} items`)

  // Count items in Antipasti
  const antipastiSection = page.locator('div.space-y-4:has(h3:has-text("Antipasti"))')
  const antipastiItems = await antipastiSection.locator('label.flex.items-start').count()
  console.log(`   Antipasti: ${antipastiItems} items`)

  // Count items in Fritti
  const frittiSection = page.locator('div.space-y-4:has(h3:has-text("Fritti"))')
  const frittiItems = await frittiSection.locator('label.flex.items-start').count()
  console.log(`   Fritti: ${frittiItems} items`)

  // Count items in Primi Piatti
  const primiSection = page.locator('div.space-y-4:has(h3:has-text("Primi Piatti"))')
  const primiItems = await primiSection.locator('label.flex.items-start').count()
  console.log(`   Primi Piatti: ${primiItems} items`)

  // Count items in Secondi Piatti
  const secondiSection = page.locator('div.space-y-4:has(h3:has-text("Secondi Piatti"))')
  const secondiItems = await secondiSection.locator('label.flex.items-start').count()
  console.log(`   Secondi Piatti: ${secondiItems} items`)

  const totalItems = bevandeItems + antipastiItems + frittiItems + primiItems + secondiItems
  console.log(`   📊 TOTAL ITEMS: ${totalItems}`)

  // Verify Panelle appears exactly once
  const panelleCount = await page.locator('label:has-text("Panelle")').count()
  console.log(`   🔍 Panelle count: ${panelleCount}`)

  // Take screenshot of complete menu
  await page.screenshot({
    path: 'e2e/screenshots/FINAL-NO-DUPLICATES-VERIFICATION.png',
    fullPage: true
  })

  // Get all visible menu item texts to check for duplicates
  const allLabels = await page.locator('label.flex.items-start').allTextContents()
  const uniqueLabels = new Set(allLabels)

  console.log(`   📝 Total labels: ${allLabels.length}`)
  console.log(`   🎯 Unique labels: ${uniqueLabels.size}`)

  if (allLabels.length !== uniqueLabels.size) {
    console.log('   ⚠️  DUPLICATES FOUND:')
    const duplicates = allLabels.filter((item, index) => allLabels.indexOf(item) !== index)
    duplicates.forEach(dup => console.log(`      - ${dup}`))
  }

  // Assertions
  expect(panelleCount).toBe(1)
  expect(totalItems).toBe(30)
  expect(allLabels.length).toBe(uniqueLabels.size)

  console.log('✅ FINAL VERIFICATION PASSED')
  console.log('   - No duplicate items found')
  console.log('   - Panelle appears exactly once')
  console.log('   - Total items = 30')
  console.log('📸 Screenshot saved: FINAL-NO-DUPLICATES-VERIFICATION.png')
})

