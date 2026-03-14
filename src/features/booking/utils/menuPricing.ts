import type { BookingRequest } from '@/types/booking'

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
  totalPerPerson: number
  basePerPerson: number
}

export const buildMenuPriceDisplay = (
  menu_total_per_person?: number | null,
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
    totalPerPerson: prezzoMenu,
    basePerPerson
  }
}

export const getMenuPriceDisplayFromBooking = (booking: BookingRequest): MenuPriceDisplay | null => {
  return buildMenuPriceDisplay(
    booking.menu_total_per_person,
    booking.menu_total_booking
  )
}

