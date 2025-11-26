import type { BookingRequest } from '@/types/booking'

export type BookingTypeWithCover = 'tavolo' | 'rinfresco_laurea' | undefined

export const COVER_CHARGE_PER_PERSON_EUR = 2

export const needsCoverCharge = (bookingType?: BookingTypeWithCover): boolean =>
  bookingType === 'rinfresco_laurea'

export const applyCoverCharge = (baseAmount: number, bookingType?: BookingTypeWithCover): number =>
  needsCoverCharge(bookingType) ? baseAmount + COVER_CHARGE_PER_PERSON_EUR : baseAmount

export const removeCoverCharge = (amount: number, bookingType?: BookingTypeWithCover): number =>
  needsCoverCharge(bookingType) ? Math.max(amount - COVER_CHARGE_PER_PERSON_EUR, 0) : amount

export interface MenuPriceDisplay {
  // Prezzo Menù: prezzo a persona (con coperto incluso se presente)
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
  bookingType?: BookingTypeWithCover,
  menu_total_booking?: number | null
): MenuPriceDisplay | null => {
  if (!menu_total_per_person || menu_total_per_person <= 0) {
    return null
  }

  const hasCoverCharge = needsCoverCharge(bookingType)
  const prezzoMenu = menu_total_per_person
  const basePerPerson = hasCoverCharge
    ? removeCoverCharge(prezzoMenu, bookingType)
    : prezzoMenu
  
  const prezzoMenuLabel = `€${prezzoMenu.toFixed(2)}/persona`
  const breakdownLabel = hasCoverCharge
    ? `(${basePerPerson.toFixed(2)} + ${COVER_CHARGE_PER_PERSON_EUR.toFixed(2)} coperto)`
    : undefined

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

