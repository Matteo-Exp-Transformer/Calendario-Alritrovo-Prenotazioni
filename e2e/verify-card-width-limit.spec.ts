import { test, expect } from '@playwright/test'

/**
 * Test empirico per verificare che TUTTE le card, titoli delle sezioni e dropdown
 * non superino il 55% della larghezza dello schermo su desktop
 * 
 * Usa skills di testing: verification-before-completion
 * Verifica obiettiva e misurabile delle modifiche implementate dall'agente
 */

test.describe('Verifica Larghezza Elementi Form - Limite 55% Schermo', () => {
  test('Tutti gli elementi (card, titoli, dropdown) devono rispettare limite 55% schermo', async ({ page }) => {
    const viewportWidth = 1920 // Desktop standard
    const maxAllowedWidth = viewportWidth * 0.55 // 55% = 1056px
    const tolerance = 20 // 20px di tolleranza per padding/border

    await page.setViewportSize({ width: viewportWidth, height: 1080 })
    await page.goto('http://localhost:5175/prenota')

    // Aspetta che il form sia caricato
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Seleziona "Rinfresco di Laurea" per mostrare menu e intolleranze
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(1000) // Attendi caricamento menu

    // Verifica elementi del form principale
    const form = page.locator('form').first()
    const formBox = await form.boundingBox()
    
    console.log('\n=== VERIFICA LARGHEZZA ELEMENTI ===')
    console.log(`Viewport Width: ${viewportWidth}px`)
    console.log(`Max Allowed (55%): ${maxAllowedWidth}px`)
    console.log(`\nForm Container: ${formBox?.width}px`)

    // 1. VERIFICA FORM CONTAINER
    if (formBox) {
      expect(formBox.width).toBeLessThanOrEqual(maxAllowedWidth + tolerance)
      console.log(`✅ Form Container: ${formBox.width}px <= ${maxAllowedWidth + tolerance}px`)
    }

    // 2. VERIFICA TITOLI SEZIONI
    const sectionHeaders = await page.locator('h2').all()
    console.log(`\n=== TITOLI SEZIONI (${sectionHeaders.length} totali) ===`)
    
    for (let i = 0; i < sectionHeaders.length; i++) {
      const header = sectionHeaders[i]
      const headerBox = await header.boundingBox()
      if (headerBox) {
        const headerText = await header.textContent()
        console.log(`"${headerText?.trim()}" - Larghezza: ${headerBox.width}px`)
        expect(headerBox.width).toBeLessThanOrEqual(maxAllowedWidth + tolerance)
      }
    }

    // 3. VERIFICA DROPDOWN TIPOLOGIA
    const dropdown = page.locator('#booking_type')
    const dropdownBox = await dropdown.boundingBox()
    console.log(`\n=== DROPDOWN TIPOLOGIA ===`)
    if (dropdownBox) {
      console.log(`Dropdown: ${dropdownBox.width}px`)
      expect(dropdownBox.width).toBeLessThanOrEqual(maxAllowedWidth + tolerance)
    }

    // 4. VERIFICA CARD DEL MENU (MenuSelection component)
    const menuCards = await page.locator('label[class*="rounded-lg"][class*="border-2"]').all()
    console.log(`\n=== CARD MENU (${menuCards.length} totali) ===`)
    
    let menuCardWidths: number[] = []
    for (let i = 0; i < menuCards.length; i++) {
      const card = menuCards[i]
      const cardBox = await card.boundingBox()
      if (cardBox) {
        menuCardWidths.push(cardBox.width)
        console.log(`Card ${i + 1}: ${cardBox.width}px`)
        expect(cardBox.width).toBeLessThanOrEqual(maxAllowedWidth + tolerance)
      }
    }

    // 5. VERIFICA TITOLI CATEGORIE MENU (h3 dentro MenuSelection)
    const categoryHeaders = await page.locator('h3').all()
    console.log(`\n=== TITOLI CATEGORIE MENU (${categoryHeaders.length} totali) ===`)
    
    for (let i = 0; i < categoryHeaders.length; i++) {
      const header = categoryHeaders[i]
      const headerBox = await header.boundingBox()
      if (headerBox) {
        const headerText = await header.textContent()
        // Filtra solo i titoli delle categorie (contengono numeri come "3/3")
        if (headerText && /\(\d+\/\d+\)/.test(headerText)) {
          console.log(`"${headerText.trim()}" - Larghezza: ${headerBox.width}px`)
          expect(headerBox.width).toBeLessThanOrEqual(maxAllowedWidth + tolerance)
        }
      }
    }

    // 6. VERIFICA CARD INTOLLERANZE (DietaryRestrictionsSection)
    const dietaryCards = await page.locator('div[class*="from-warm-cream"]').all()
    console.log(`\n=== CARD INTOLLERANZE (${dietaryCards.length} totali) ===`)
    
    for (let i = 0; i < dietaryCards.length; i++) {
      const card = dietaryCards[i]
      const cardBox = await card.boundingBox()
      if (cardBox && cardBox.width > 100) { // Filtra solo le card principali (escludi piccoli elementi)
        const cardText = await card.textContent()
        console.log(`Card "${cardText?.substring(0, 50)}..." - Larghezza: ${cardBox.width}px`)
        expect(cardBox.width).toBeLessThanOrEqual(maxAllowedWidth + tolerance)
      }
    }

    // 7. VERIFICA DROPDOWN INTOLLERANZE
    const dietaryDropdown = page.locator('select[class*="rounded-full"]').first()
    const dietaryDropdownBox = await dietaryDropdown.boundingBox()
    console.log(`\n=== DROPDOWN INTOLLERANZE ===`)
    if (dietaryDropdownBox) {
      console.log(`Dropdown Intolleranze: ${dietaryDropdownBox.width}px`)
      expect(dietaryDropdownBox.width).toBeLessThanOrEqual(maxAllowedWidth + tolerance)
    }

    // 8. VERIFICA INPUT FIELDS (tutti devono rispettare il limite)
    const inputFields = await page.locator('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="time"]').all()
    console.log(`\n=== INPUT FIELDS (${inputFields.length} totali) ===`)
    
    for (let i = 0; i < inputFields.length; i++) {
      const input = inputFields[i]
      const inputBox = await input.boundingBox()
      if (inputBox) {
        const inputType = await input.getAttribute('type') || await input.getAttribute('id')
        console.log(`Input ${inputType}: ${inputBox.width}px`)
        expect(inputBox.width).toBeLessThanOrEqual(maxAllowedWidth + tolerance)
      }
    }

    // Screenshot finale per evidenza
    await page.screenshot({
      path: 'e2e/screenshots/verify-card-width-limit-desktop.png',
      fullPage: true
    })

    console.log('\n=== RIEPILOGO VERIFICA ===')
    console.log(`✅ Tutti gli elementi rispettano il limite del 55% (${maxAllowedWidth}px)`)
    console.log(`Screenshot salvato: e2e/screenshots/verify-card-width-limit-desktop.png`)
  })

  test('Verifica responsive mobile - card si estendono correttamente', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('http://localhost:5175/prenota')

    await page.waitForSelector('form', { timeout: 10000 })
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(1000)

    // Su mobile, le card possono estendersi (ma non devono superare 100% viewport)
    const form = page.locator('form').first()
    const formBox = await form.boundingBox()

    if (formBox) {
      // Su mobile, il form dovrebbe usare tutto lo spazio disponibile (meno padding)
      const maxMobileWidth = 375 // viewport width
      expect(formBox.width).toBeLessThanOrEqual(maxMobileWidth)
      console.log(`✅ Mobile Form: ${formBox.width}px <= ${maxMobileWidth}px`)
    }

    await page.screenshot({
      path: 'e2e/screenshots/verify-card-width-limit-mobile.png',
      fullPage: true
    })
  })
})


