import { test } from '@playwright/test'

/**
 * Test di debug per ispezionare il valore effettivo dell'input num_guests
 * Questo test serve a capire ESATTAMENTE cosa sta succedendo nel browser
 */

test('Debug: Ispeziona input num_guests - valore effettivo e attributi', async ({ page }) => {
  // Vai alla pagina
  await page.goto('http://localhost:5174/prenota')

  // Attendi che l'input sia visibile
  await page.waitForSelector('#num_guests', { state: 'visible', timeout: 10000 })

  // Fai uno screenshot iniziale
  await page.screenshot({ path: 'e2e/screenshots/debug-num-guests-01-initial.png', fullPage: true })

  const input = page.locator('#num_guests')

  // ISPEZIONA TUTTI GLI ATTRIBUTI
  console.log('\n=== ATTRIBUTI INPUT ===')
  console.log('id:', await input.getAttribute('id'))
  console.log('type:', await input.getAttribute('type'))
  console.log('value:', await input.getAttribute('value'))
  console.log('defaultValue:', await input.getAttribute('defaultValue'))
  console.log('placeholder:', await input.getAttribute('placeholder'))
  console.log('autocomplete:', await input.getAttribute('autocomplete'))
  console.log('min:', await input.getAttribute('min'))
  console.log('inputMode:', await input.getAttribute('inputMode'))
  console.log('pattern:', await input.getAttribute('pattern'))

  // ISPEZIONA IL VALORE VISIBILE
  console.log('\n=== VALORE VISIBILE ===')
  const inputValue = await input.inputValue()
  console.log('inputValue():', inputValue)
  console.log('inputValue() lunghezza:', inputValue.length)
  console.log('inputValue() è vuoto?:', inputValue === '')
  console.log('inputValue() è "1"?:', inputValue === '1')

  // ISPEZIONA L'HTML COMPLETO
  console.log('\n=== HTML COMPLETO ===')
  const outerHTML = await input.evaluate((el: HTMLInputElement) => el.outerHTML)
  console.log(outerHTML)

  // ISPEZIONA IL VALORE VIA JAVASCRIPT
  console.log('\n=== VALORE VIA JAVASCRIPT ===')
  const jsValue = await input.evaluate((el: HTMLInputElement) => el.value)
  console.log('el.value:', jsValue)

  // ISPEZIONA IL PLACEHOLDER
  const jsPlaceholder = await input.evaluate((el: HTMLInputElement) => el.placeholder)
  console.log('el.placeholder:', jsPlaceholder)

  // ISPEZIONA COMPUTED STYLES
  console.log('\n=== COMPUTED STYLES ===')
  const styles = await input.evaluate((el: HTMLInputElement) => {
    const computed = window.getComputedStyle(el)
    return {
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      color: computed.color,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
    }
  })
  console.log('Styles:', styles)

  // ISPEZIONA PSEUDO-ELEMENTI ::before e ::after
  console.log('\n=== PSEUDO-ELEMENTI ===')
  const pseudoContent = await input.evaluate((el: HTMLInputElement) => {
    const before = window.getComputedStyle(el, '::before').content
    const after = window.getComputedStyle(el, '::after').content
    return { before, after }
  })
  console.log('::before content:', pseudoContent.before)
  console.log('::after content:', pseudoContent.after)

  // CLICCA SUL CAMPO E ISPEZIONA
  console.log('\n=== DOPO CLICK ===')
  await input.click()
  await page.waitForTimeout(500)

  const valueAfterClick = await input.inputValue()
  console.log('inputValue() dopo click:', valueAfterClick)

  await page.screenshot({ path: 'e2e/screenshots/debug-num-guests-02-after-click.png', fullPage: true })

  // PROVA A SELEZIONARE TUTTO
  console.log('\n=== DOPO SELECT ALL ===')
  await page.keyboard.press('Control+A')
  await page.waitForTimeout(200)

  const selectedText = await input.evaluate((el: HTMLInputElement) => {
    const start = el.selectionStart
    const end = el.selectionEnd
    const selectedValue = el.value.substring(start || 0, end || 0)
    return {
      start,
      end,
      selectedValue,
      fullValue: el.value
    }
  })
  console.log('Selection:', selectedText)

  await page.screenshot({ path: 'e2e/screenshots/debug-num-guests-03-after-select-all.png', fullPage: true })

  // PROVA A CANCELLARE
  console.log('\n=== DOPO DELETE ===')
  await page.keyboard.press('Delete')
  await page.waitForTimeout(200)

  const valueAfterDelete = await input.inputValue()
  console.log('inputValue() dopo Delete:', valueAfterDelete)
  console.log('è vuoto?:', valueAfterDelete === '')

  await page.screenshot({ path: 'e2e/screenshots/debug-num-guests-04-after-delete.png', fullPage: true })

  // ISPEZIONA REACT STATE (tramite React DevTools API se disponibile)
  console.log('\n=== REACT STATE (se disponibile) ===')
  const reactState = await page.evaluate(() => {
    // Prova a accedere al React Fiber
    const input = document.querySelector('#num_guests') as any
    if (input && input._reactProps) {
      return input._reactProps
    }
    return 'React state non accessibile'
  })
  console.log('React props:', reactState)

  console.log('\n=== FINE DEBUG ===')
})
