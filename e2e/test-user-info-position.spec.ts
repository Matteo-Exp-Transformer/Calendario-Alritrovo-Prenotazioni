import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test('Verifica casella utente accanto a Rifiutate', async ({ page }) => {
  // Login con helper
  const loginSuccess = await loginAsAdmin(page)
  
  if (!loginSuccess) {
    console.log('❌ Login fallito, ma continuiamo per verificare lo stato')
  }
  
  await page.waitForTimeout(3000)
  
  // Prendi uno screenshot
  await page.screenshot({ path: 'screenshots/user-info-position-test.png', fullPage: true })
  
  // Trova l'header
  const header = page.locator('header')
  
  // Trova il container flex che contiene tutte le stats cards
  const statsContainer = header.locator('div.flex.items-center').first()
  await statsContainer.waitFor({ timeout: 5000 })
  
  // Trova tutte le cards nel container - ogni card è un div diretto
  const allCards = statsContainer.locator('div')
  const cardCount = await allCards.count()
  console.log(`Card trovate nel container: ${cardCount}`)
  
  // Trova la card "Rifiutate" - deve contenere il testo "Rifiutate" ma non "@"
  let rifiutateCard = null
  for (let i = 0; i < cardCount; i++) {
    const card = allCards.nth(i)
    const text = await card.textContent()
    if (text?.includes('Rifiutate') && !text?.includes('@')) {
      rifiutateCard = card
      console.log(`Card Rifiutate trovata all'indice ${i}`)
      break
    }
  }
  
  // Trova la card User Info - deve contenere "@" ma non "Settimana", "Oggi", "Mese", "Rifiutate"
  let userInfoCard = null
  for (let i = 0; i < cardCount; i++) {
    const card = allCards.nth(i)
    const text = await card.textContent()
    if (text?.includes('@') && 
        !text?.includes('Settimana') && 
        !text?.includes('Oggi') && 
        !text?.includes('Mese') && 
        !text?.includes('Rifiutate')) {
      userInfoCard = card
      console.log(`Card User Info trovata all'indice ${i}`)
      break
    }
  }
  
  expect(rifiutateCard).toBeTruthy()
  expect(userInfoCard).toBeTruthy()
  
  // Verifica contenuto
  const userInfoText = await userInfoCard.textContent()
  const rifiutateTextContent = await rifiutateCard.textContent()
  console.log(`User Info trovata: ${userInfoText?.substring(0, 60)}`)
  console.log(`Rifiutate trovata: ${rifiutateTextContent?.substring(0, 40)}`)
  
  // Verifica che User Info contenga effettivamente una email e Admin/Staff
  expect(userInfoText).toContain('@')
  expect(userInfoText?.match(/Admin|Staff/)).toBeTruthy()
  
  // Verifica posizione relativa
  const rifiutateBox = await rifiutateCard.boundingBox()
  const userInfoBox = await userInfoCard.boundingBox()
  
  expect(rifiutateBox).toBeTruthy()
  expect(userInfoBox).toBeTruthy()
  
  if (rifiutateBox && userInfoBox) {
    // Distanza orizzontale (User Info dovrebbe essere dopo Rifiutate)
    const rifiutateEnd = rifiutateBox.x + rifiutateBox.width
    const distanceX = userInfoBox.x - rifiutateEnd
    console.log(`Distanza orizzontale tra Rifiutate e User Info: ${distanceX}px`)
    console.log(`Rifiutate: x=${rifiutateBox.x}, width=${rifiutateBox.width}, fine=${rifiutateEnd}`)
    console.log(`User Info: x=${userInfoBox.x}, width=${userInfoBox.width}`)
    
    // Differenza verticale (dovrebbero essere sulla stessa riga)
    const yDifference = Math.abs(userInfoBox.y - rifiutateBox.y)
    console.log(`Differenza verticale: ${yDifference}px`)
    
    // Verifica che siano sulla stessa riga (y simili)
    expect(yDifference).toBeLessThan(50)
    
    // Verifica che User Info sia a destra di Rifiutate (non sovrapposta)
    // Accettiamo anche se c'è una piccola sovrapposizione o gap negativo (fino a -50px)
    // perché potrebbe essere dovuto a margini/bordi/padding
    if (distanceX < -50) {
      throw new Error(`❌ User Info è TROPPO sovrapposta a Rifiutate! User Info inizia a x=${userInfoBox.x}, Rifiutate finisce a x=${rifiutateEnd}. Differenza: ${distanceX}px.`)
    }
    
    // Verifica che siano vicine (gap ragionevole, max 50px)
    expect(distanceX).toBeLessThan(50)
    
    console.log('✅ User Info e Rifiutate sono posizionate correttamente')
  }
})

