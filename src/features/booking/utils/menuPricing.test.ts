import { describe, expect, test } from 'vitest'
import {
  buildMenuPriceDisplay,
} from './menuPricing'

describe('menuPricing', () => {
  test('buildMenuPriceDisplay does not expose coperto in breakdown for rinfresco_laurea', () => {
    const menu_total_per_person = 25
    const menu_total_booking = 250

    const display = buildMenuPriceDisplay(
      menu_total_per_person,
      menu_total_booking,
    )

    expect(display).not.toBeNull()
    if (!display) return

    // Prezzo per persona rimane quello salvato sul booking
    expect(display.prezzoMenu).toBe(menu_total_per_person)
    // Nessuna label di breakdown che menzioni il coperto
    expect(display.breakdownLabel).toBeUndefined()
    expect(display.prezzoMenuLabel.toLowerCase()).not.toContain('coperto')
  })
})
