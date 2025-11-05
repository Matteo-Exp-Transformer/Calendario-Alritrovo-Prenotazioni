import { test, expect } from '@playwright/test'

/**
 * Test visivo per verificare padding nelle card del menu
 * Skill: verification-before-completion - Verifica visiva obiettiva
 */

test.describe('Verifica Visiva Padding Card Menu', () => {
  test('Le card del menu devono avere padding adeguato tra testo e bordi', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5175/prenota')

    // Aspetta che il form sia caricato
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Seleziona "Rinfresco di Laurea" per mostrare menu
    await page.selectOption('#booking_type', 'rinfresco_laurea')
    await page.waitForTimeout(2000) // Attendi caricamento menu completo

    // Trova le card del menu (label elements)
    const menuCards = await page.locator('label[class*="rounded-lg"][class*="border-2"]').all()
    
    console.log(`\n=== VERIFICA VISIVA PADDING CARD MENU ===`)
    console.log(`Trovate ${menuCards.length} card del menu`)

    // Verifica almeno una card è visibile
    expect(menuCards.length).toBeGreaterThan(0)

    // Prendi screenshot prima di misurare
    await page.screenshot({
      path: 'e2e/screenshots/menu-cards-padding-before-verification.png',
      fullPage: true
    })

    // Misura padding per le prime 3 card
    for (let i = 0; i < Math.min(3, menuCards.length); i++) {
      const card = menuCards[i]
      
      // Verifica che la card sia visibile
      await expect(card).toBeVisible()
      
      // Ottieni bounding box della card
      const cardBox = await card.boundingBox()
      if (!cardBox) continue

      // Trova il contenuto interno (div con flex-1)
      const contentDiv = card.locator('div.flex-1').first()
      const contentBox = await contentDiv.boundingBox()
      
      // Trova il nome prodotto
      const nameSpan = contentDiv.locator('span').first()
      const nameBox = await nameSpan.boundingBox()
      
      // Trova il prezzo
      const priceSpan = contentDiv.locator('span').last()
      const priceBox = await priceSpan.boundingBox()

      if (cardBox && contentBox && nameBox && priceBox) {
        // Calcola padding effettivo
        const paddingLeft = contentBox.x - cardBox.x
        const paddingRight = cardBox.x + cardBox.width - (contentBox.x + contentBox.width)
        const paddingTop = contentBox.y - cardBox.y
        const paddingBottom = cardBox.y + cardBox.height - (contentBox.y + contentBox.height)

        // Calcola padding del testo rispetto al contenuto
        const textPaddingLeft = nameBox.x - contentBox.x
        const textPaddingRight = (priceBox.x + priceBox.width) - (contentBox.x + contentBox.width)

        console.log(`\n--- Card ${i + 1} ---`)
        console.log(`Card size: ${cardBox.width}x${cardBox.height}px`)
        console.log(`Content size: ${contentBox.width}x${contentBox.height}px`)
        console.log(`Padding esterno - Left: ${paddingLeft.toFixed(1)}px, Right: ${paddingRight.toFixed(1)}px`)
        console.log(`Padding esterno - Top: ${paddingTop.toFixed(1)}px, Bottom: ${paddingBottom.toFixed(1)}px`)
        console.log(`Padding interno testo - Left: ${textPaddingLeft.toFixed(1)}px, Right: ${textPaddingRight.toFixed(1)}px`)
        console.log(`Padding totale Left: ${(paddingLeft + textPaddingLeft).toFixed(1)}px`)
        console.log(`Padding totale Right: ${(paddingRight + textPaddingRight).toFixed(1)}px`)

        // Verifica che il padding sia adeguato (almeno 40px totale per lato)
        const totalPaddingLeft = paddingLeft + textPaddingLeft
        const totalPaddingRight = paddingRight + textPaddingRight

        expect(totalPaddingLeft).toBeGreaterThanOrEqual(40, 
          `Padding sinistro totale ${totalPaddingLeft.toFixed(1)}px dovrebbe essere >= 40px`)
        expect(totalPaddingRight).toBeGreaterThanOrEqual(40,
          `Padding destro totale ${totalPaddingRight.toFixed(1)}px dovrebbe essere >= 40px`)
        expect(paddingTop).toBeGreaterThanOrEqual(20,
          `Padding top ${paddingTop.toFixed(1)}px dovrebbe essere >= 20px`)

        console.log(`✅ Card ${i + 1}: Padding verificato correttamente`)
      }
    }

    // Screenshot finale
    await page.screenshot({
      path: 'e2e/screenshots/menu-cards-padding-verification-complete.png',
      fullPage: true
    })

    console.log(`\n✅ Verifica visiva completata`)
    console.log(`Screenshots salvati in e2e/screenshots/`)
  })
})








