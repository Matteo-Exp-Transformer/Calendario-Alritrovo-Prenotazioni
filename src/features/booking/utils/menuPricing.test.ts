import { describe, expect, test } from 'vitest'
import {
  applyCoverCharge,
  buildMenuPriceDisplay,
  type BookingTypeWithCover,
} from './menuPricing'

describe('menuPricing - coperto removal', () => {
  test('applyCoverCharge does not modify base amount for any booking type', () => {
    const baseAmount = 25

    const bookingTypes: BookingTypeWithCover[] = ['tavolo', 'rinfresco_laurea', undefined]

    for (const bookingType of bookingTypes) {
      const result = applyCoverCharge(baseAmount, bookingType)
      expect(result).toBe(baseAmount)
    }
  })

  test('buildMenuPriceDisplay does not expose coperto in breakdown for rinfresco_laurea', () => {
    const menu_total_per_person = 25
    const bookingType: BookingTypeWithCover = 'rinfresco_laurea'
    const menu_total_booking = 250

    const display = buildMenuPriceDisplay(
      menu_total_per_person,
      bookingType,
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

