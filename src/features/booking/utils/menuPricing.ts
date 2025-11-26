import type { BookingRequest } from '@/types/booking'

export type BookingTypeWithCover = 'tavolo' | 'rinfresco_laurea' | undefined

export const COVER_CHARGE_PER_PERSON_EUR = 2

export const needsCoverCharge = (bookingType?: BookingTypeWithCover): boolean =>
  bookingType === 'rinfresco_laurea'

export const applyCoverCharge = (baseAmount: number, bookingType?: BookingTypeWithCover): number =>
  needsCoverCharge(bookingType) ? baseAmount + COVER_CHARGE_PER_PERSON_EUR : baseAmount

export const removeCoverCharge = (amount: number, bookingType?: BookingTypeWithCover): number =>
  needsCoverCharge(bookingType) ? Math.max(amount - COVER_CHARGE_PER_PERSON_EUR, 0) : amount

interface MenuPriceDisplayOptions {
  menu_total_booking?: number | null
  num_guests?: number | null
  tiramisu_total?: number | null
}

export interface MenuPriceDisplay {
  totalLabel: string
  breakdownLabel?: string
  perPersonWithCover: number
  basePerPerson: number
}

export const buildMenuPriceDisplay = (
  totalPerPerson?: number | null,
  bookingType?: BookingTypeWithCover,
  options?: MenuPriceDisplayOptions
): MenuPriceDisplay | null => {
  if (!totalPerPerson || totalPerPerson <= 0) {
    return null
  }

  let perPersonWithCover = totalPerPerson
  let basePerPerson = needsCoverCharge(bookingType)
    ? removeCoverCharge(totalPerPerson, bookingType)
    : totalPerPerson

  if (
    needsCoverCharge(bookingType) &&
    options?.menu_total_booking &&
    options?.num_guests &&
    options.num_guests > 0
  ) {
    const tiramisuTotal = options.tiramisu_total || 0
    const derived =
      (options.menu_total_booking - tiramisuTotal) / options.num_guests

    if (Number.isFinite(derived) && derived > 0) {
      const difference = Math.abs(derived - totalPerPerson)
      if (difference > 0.01) {
        // Legacy data: stored value was without cover charge
        basePerPerson = totalPerPerson
        perPersonWithCover = derived
      } else {
        perPersonWithCover = totalPerPerson
        basePerPerson = removeCoverCharge(totalPerPerson, bookingType)
      }
    }
  }

  const totalLabel = `€${perPersonWithCover.toFixed(2)}/persona`

  if (!needsCoverCharge(bookingType)) {
    return {
      totalLabel,
      perPersonWithCover,
      basePerPerson
    }
  }

  const breakdownLabel = `(${basePerPerson.toFixed(2)} + ${COVER_CHARGE_PER_PERSON_EUR.toFixed(2)} coperto)`

  return {
    totalLabel,
    breakdownLabel,
    perPersonWithCover,
    basePerPerson
  }
}

export const getMenuPriceDisplayFromBooking = (booking: BookingRequest): MenuPriceDisplay | null => {
  const tiramisuTotal = booking.menu_selection?.tiramisu_total || 0

  return buildMenuPriceDisplay(
    booking.menu_total_per_person,
    booking.booking_type,
    {
      menu_total_booking: booking.menu_total_booking,
      num_guests: booking.num_guests,
      tiramisu_total: tiramisuTotal
    }
  )
}

