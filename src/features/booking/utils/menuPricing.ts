import type { BookingRequest } from '@/types/booking'

export type BookingTypeWithCover = 'tavolo' | 'rinfresco_laurea' | undefined

// Legacy constant kept for backward-compatibility with stored data and types
export const COVER_CHARGE_PER_PERSON_EUR = 0

export const needsCoverCharge = (_bookingType?: BookingTypeWithCover): boolean => false

export const applyCoverCharge = (baseAmount: number, _bookingType?: BookingTypeWithCover): number =>
  baseAmount

export const removeCoverCharge = (amount: number, _bookingType?: BookingTypeWithCover): number =>
  amount

export interface MenuPriceDisplay {
  // Prezzo Menù: prezzo a persona
  prezzoMenu: number
  prezzoMenuLabel: string
  breakdownLabel?: string
  
  // Prezzo Totale: prezzo totale prenotazione (con tiramisu se presente)
  prezzoTotale: number | null
  prezzoTotaleLabel: string | null
  
  // Campi legacy per retrocompatibilità
  totalLabel: string
  perPersonWithCover: number
  basePerPerson: number
}

export const buildMenuPriceDisplay = (
  menu_total_per_person?: number | null,
  _bookingType?: BookingTypeWithCover,
  menu_total_booking?: number | null
): MenuPriceDisplay | null => {
  if (!menu_total_per_person || menu_total_per_person <= 0) {
    return null
  }

  const prezzoMenu = menu_total_per_person
  const basePerPerson = prezzoMenu
  
  const prezzoMenuLabel = `€${prezzoMenu.toFixed(2)}/persona`
  const breakdownLabel = undefined

  const prezzoTotale = menu_total_booking ?? null
  const prezzoTotaleLabel = prezzoTotale !== null
    ? `€${prezzoTotale.toFixed(2)}`
    : null

  return {
    prezzoMenu,
    prezzoMenuLabel,
    breakdownLabel,
    prezzoTotale,
    prezzoTotaleLabel,
    // Legacy fields per retrocompatibilità
    totalLabel: prezzoMenuLabel,
    perPersonWithCover: prezzoMenu,
    basePerPerson
  }
}

export const getMenuPriceDisplayFromBooking = (booking: BookingRequest): MenuPriceDisplay | null => {
  return buildMenuPriceDisplay(
    booking.menu_total_per_person,
    booking.booking_type,
    booking.menu_total_booking
  )
}

