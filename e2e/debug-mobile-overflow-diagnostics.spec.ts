import { test, expect } from '@playwright/test'

/**
 * E2E Test: Debug Mobile Overflow - Diagnostic Scripts
 *
 * This test runs your diagnostic scripts to identify which element is causing
 * horizontal overflow on mobile (375x667 - iPhone SE).
 *
 * It will:
 * 1. Navigate to admin dashboard
 * 2. Set viewport to mobile size
 * 3. Click on first booking to open modal
 * 4. Take a screenshot
 * 5. Run diagnostic script to find overflowing elements
 * 6. Run modal-specific diagnostic script
 * 7. Return results
 */

test('Debug Mobile Overflow - Find Overflowing Elements', async ({ page }) => {
  // Set viewport to mobile size FIRST (375x667 - iPhone SE)
  await page.setViewportSize({ width: 375, height: 667 })
  console.log('Viewport set to mobile: 375x667')

  // Login
  await page.goto('http://localhost:5175/login')
  await page.waitForLoadState('networkidle')

  const emailInput = page.locator('#email')
  const passwordInput = page.locator('#password')
  const submitButton = page.locator('button[type="submit"]').filter({ hasText: /accedi/i })

  await emailInput.fill('0cavuz0@gmail.com')
  await passwordInput.fill('Cavallaro')
  await submitButton.click()
  await page.waitForURL('**/admin', { timeout: 10000 })
  console.log('Logged in and navigated to admin')

  // Wait for page to load fully
  await page.waitForLoadState('networkidle')

  // Navigate to Calendario tab if visible
  try {
    const calendarioTab = page.locator('button').filter({ hasText: /Calendario/i })
    if (await calendarioTab.isVisible({ timeout: 2000 })) {
      await calendarioTab.click()
      await page.waitForSelector('.fc-view', { timeout: 5000 })
      console.log('Navigated to Calendario tab')
    }
  } catch {
    console.log('Calendario tab not found, already on calendar view')
  }

  // Find and click a booking event
  try {
    const bookingEvent = page.locator('.fc-event').first()
    await bookingEvent.click()
    await page.waitForTimeout(500)
    console.log('Clicked on booking event')
  } catch {
    console.log('No booking events found, trying admin dashboard cards')
    const firstCard = page.locator('[data-testid="booking-card"]').first()
    await firstCard.click()
    console.log('Clicked on booking card')
  }

  // Wait for modal to be visible
  await page.waitForSelector('text=Dettagli Prenotazione', { timeout: 5000 })
  console.log('Modal opened')

  // Take screenshot showing current state
  const screenshotPath = 'e2e/screenshots/debug-mobile-overflow-current-state.png'
  await page.screenshot({ path: screenshotPath })
  console.log(`Screenshot saved: ${screenshotPath}`)

  // ============================================================================
  // DIAGNOSTIC SCRIPT 1: Find all elements wider than viewport
  // ============================================================================

  const overflowingElementsResult = await page.evaluate(() => {
    const viewport = window.innerWidth
    const allElements = document.querySelectorAll('*')
    const overflowingElements: Array<{
      tag: string
      class: string
      width: number
      overflow: number
      id?: string
      dataTestId?: string
      textContent: string
    }> = []

    allElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.width > viewport) {
        overflowingElements.push({
          tag: el.tagName,
          class: el.className,
          width: Math.round(rect.width),
          overflow: Math.round(rect.width - viewport),
          id: (el as HTMLElement).id || undefined,
          dataTestId: (el as HTMLElement).getAttribute('data-testid') || undefined,
          textContent: (el as HTMLElement).textContent?.substring(0, 50) || ''
        })
      }
    })

    return {
      viewportWidth: viewport,
      overflowingCount: overflowingElements.length,
      elements: overflowingElements.sort((a, b) => b.overflow - a.overflow)
    }
  })

  console.log('\n=== DIAGNOSTIC 1: Overflowing Elements ===')
  console.log(`Viewport width: ${overflowingElementsResult.viewportWidth}px`)
  console.log(`Total overflowing elements: ${overflowingElementsResult.overflowingCount}`)
  console.log('\nTop overflowing elements (sorted by overflow amount):')
  overflowingElementsResult.elements.slice(0, 10).forEach((el, idx) => {
    console.log(`  ${idx + 1}. <${el.tag}> (width: ${el.width}px, overflow: ${el.overflow}px)`)
    console.log(`     Class: ${el.class || '(none)'}`)
    if (el.id) console.log(`     ID: ${el.id}`)
    if (el.dataTestId) console.log(`     Data-testid: ${el.dataTestId}`)
    console.log(`     Text: "${el.textContent}"`)
  })

  // ============================================================================
  // DIAGNOSTIC SCRIPT 2: Check modal specifically
  // ============================================================================

  const modalDiagnosticsResult = await page.evaluate(() => {
    // Find modal by looking for the element with specific background color and positioning
    let modal = null

    // Try multiple methods to find the modal
    // Method 1: Look for fixed/absolute positioned elements with amber background
    const allDivs = document.querySelectorAll('div')
    for (const div of allDivs) {
      const style = window.getComputedStyle(div)
      const bgColor = style.backgroundColor
      const position = style.position

      // Check if this has the modal background color
      if ((bgColor === 'rgb(254, 243, 199)' || bgColor === 'rgba(254, 243, 199, 1)') &&
          (position === 'absolute' || position === 'fixed')) {
        const width = (div as HTMLElement).style.width
        const maxWidth = (div as HTMLElement).style.maxWidth
        if (width || maxWidth) {
          modal = div
          break
        }
      }
    }

    // Method 2: Fallback - look for element with data styling
    if (!modal) {
      const positioned = document.querySelectorAll('[style*="position"][style*="display"]')
      for (const el of positioned) {
        const html = el as HTMLElement
        if (html.textContent?.includes('Dettagli Prenotazione')) {
          modal = el
          break
        }
      }
    }

    if (!modal) {
      return { found: false, message: 'Modal not found with standard selectors' }
    }

    const modalRect = modal.getBoundingClientRect()
    const wide: Array<{
      tag: string
      class: string
      scrollWidth: number
      clientWidth: number
      textContent: string
      depth: number
    }> = []

    const checkChildren = (el: Element, depth: number = 0) => {
      const w = (el as HTMLElement).scrollWidth
      if (w > 375) {
        wide.push({
          tag: el.tagName,
          class: (el as HTMLElement).className,
          scrollWidth: w,
          clientWidth: (el as HTMLElement).clientWidth,
          textContent: (el as HTMLElement).textContent?.substring(0, 50) || '',
          depth
        })
      }

      // Recursively check children (limit depth to avoid too much data)
      if (depth < 5) {
        for (let i = 0; i < el.children.length; i++) {
          checkChildren(el.children[i], depth + 1)
        }
      }
    }

    checkChildren(modal, 0)

    return {
      found: true,
      modalWidth: Math.round(modalRect.width),
      modalScrollWidth: (modal as HTMLElement).scrollWidth,
      modalClientWidth: (modal as HTMLElement).clientWidth,
      wideElementsCount: wide.length,
      wideElements: wide.sort((a, b) => b.scrollWidth - a.scrollWidth).slice(0, 15)
    }
  })

  console.log('\n=== DIAGNOSTIC 2: Modal Specific Analysis ===')
  if (modalDiagnosticsResult.found) {
    console.log(`Modal width: ${modalDiagnosticsResult.modalWidth}px`)
    console.log(`Modal scrollWidth: ${modalDiagnosticsResult.modalScrollWidth}px`)
    console.log(`Modal clientWidth: ${modalDiagnosticsResult.modalClientWidth}px`)
    console.log(`Elements with scrollWidth > 375px: ${modalDiagnosticsResult.wideElementsCount}`)

    if (modalDiagnosticsResult.wideElements.length > 0) {
      console.log('\nWide elements inside modal (sorted by scrollWidth):')
      modalDiagnosticsResult.wideElements.forEach((el, idx) => {
        console.log(`  ${idx + 1}. <${el.tag}> scrollWidth=${el.scrollWidth}px`)
        console.log(`     Class: ${el.class || '(none)'}`)
        console.log(`     Depth: ${el.depth}`)
        console.log(`     Text: "${el.textContent}"`)
      })
    }
  } else {
    console.log('Modal not found - check if it rendered correctly')
  }

  // ============================================================================
  // DIAGNOSTIC SCRIPT 3: Check specific problem areas
  // ============================================================================

  const problemAreasResult = await page.evaluate(() => {
    const issues: Array<{
      area: string
      issue: string
      width: number
      viewport: number
    }> = []

    const viewport = window.innerWidth

    // Check header area
    const header = document.querySelector('[style*="paddingLeft"][style*="paddingRight"]')
    if (header) {
      const headerWidth = (header as HTMLElement).scrollWidth
      if (headerWidth > viewport) {
        issues.push({
          area: 'Header',
          issue: `scrollWidth (${headerWidth}px) > viewport (${viewport}px)`,
          width: headerWidth,
          viewport
        })
      }
    }

    // Check tab buttons area
    const tabContainer = document.querySelector('.flex.gap-1')
    if (tabContainer) {
      const tabWidth = (tabContainer as HTMLElement).scrollWidth
      if (tabWidth > viewport) {
        issues.push({
          area: 'Tab Buttons',
          issue: `scrollWidth (${tabWidth}px) > viewport (${viewport}px)`,
          width: tabWidth,
          viewport
        })
      }
    }

    // Check content area
    const contentArea = document.querySelector('[style*="overflowY"]')
    if (contentArea) {
      const contentWidth = (contentArea as HTMLElement).scrollWidth
      if (contentWidth > viewport) {
        issues.push({
          area: 'Content Area',
          issue: `scrollWidth (${contentWidth}px) > viewport (${viewport}px)`,
          width: contentWidth,
          viewport
        })
      }
    }

    // Check footer buttons
    const footer = document.querySelector('[style*="borderTop"]')
    if (footer) {
      const footerWidth = (footer as HTMLElement).scrollWidth
      if (footerWidth > viewport) {
        issues.push({
          area: 'Footer Buttons',
          issue: `scrollWidth (${footerWidth}px) > viewport (${viewport}px)`,
          width: footerWidth,
          viewport
        })
      }
    }

    // Check all input elements (they can be problematic on mobile)
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach((input) => {
      const inputWidth = (input as HTMLElement).scrollWidth
      if (inputWidth > viewport) {
        const label = (input as HTMLElement).getAttribute('placeholder') ||
                     (input.previousElementSibling as HTMLElement)?.textContent ||
                     '(no label)'
        issues.push({
          area: `Input: ${label}`,
          issue: `scrollWidth (${inputWidth}px) > viewport (${viewport}px)`,
          width: inputWidth,
          viewport
        })
      }
    })

    return issues
  })

  console.log('\n=== DIAGNOSTIC 3: Problem Areas ===')
  if (problemAreasResult.length > 0) {
    console.log(`Found ${problemAreasResult.length} problem area(s):`)
    problemAreasResult.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue.area}`)
      console.log(`     ${issue.issue}`)
    })
  } else {
    console.log('No specific problem areas detected (might be subtle padding/margin issues)')
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log('\n=== SUMMARY ===')
  console.log(`Total overflowing elements found: ${overflowingElementsResult.overflowingCount}`)
  console.log(`Modal found: ${modalDiagnosticsResult.found}`)
  console.log(`Problem areas detected: ${problemAreasResult.length}`)

  // Store results in a format that can be asserted
  expect(overflowingElementsResult.viewportWidth).toBe(375)

  // Log all data for manual review
  console.log('\n=== FULL RESULTS (JSON) ===')
  console.log(JSON.stringify({
    screenshotPath,
    overflowingElements: overflowingElementsResult,
    modalDiagnostics: modalDiagnosticsResult,
    problemAreas: problemAreasResult
  }, null, 2))
})
