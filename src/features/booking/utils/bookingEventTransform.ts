import type { BookingRequest } from '@/types/booking'
import type { CalendarEvent } from '@/types/booking'

// Colori in base alla fascia oraria (delicati e leggibili)
const TIME_SLOT_COLORS = {
  morning: { bg: '#10B981', border: '#059669', text: '#000000' },           // Verde: 08:00-12:00
  afternoon: { bg: '#FDE047', border: '#FACC15', text: '#000000' },          // Giallo delicato: 12:01-17:00
  evening: { bg: '#93C5FD', border: '#60A5FA', text: '#000000' },           // Azzurro delicato: 17:01-07:59
}

/**
 * Determina il colore in base alla fascia oraria di inizio
 * - Verde: 08:00 - 12:00
 * - Arancione: 12:01 - 17:00
 * - Azzurro: 17:01 - 07:59
 */
function getTimeSlotColor(startDate: Date): { bg: string; border: string; text: string } {
  const hour = startDate.getHours()
  
  if (hour >= 8 && hour < 12) {
    return TIME_SLOT_COLORS.morning
  } else if (hour >= 12 && hour < 17) {
    return TIME_SLOT_COLORS.afternoon
  } else {
    return TIME_SLOT_COLORS.evening
  }
}

export const transformBookingToCalendarEvent = (
  booking: BookingRequest
): CalendarEvent => {
  // Parse dates and ensure they're interpreted as local time
  const startStr = booking.confirmed_start!
  const endStr = booking.confirmed_end!
  
  let startDate: Date
  let endDate: Date
  
  // If dates are stored as ISO strings without timezone (local format)
  if (startStr.includes('T') && !startStr.includes('Z')) {
    // Parse local ISO format: "2024-01-15T20:00:00" -> local time components
    const startParts = startStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
    if (startParts) {
      const [, year, month, day, hour, minute, second] = startParts
      startDate = new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day), 
        parseInt(hour), 
        parseInt(minute),
        parseInt(second)
      )
    } else {
      startDate = new Date(startStr)
    }
    
    const endParts = endStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
    if (endParts) {
      const [, year, month, day, hour, minute, second] = endParts
      endDate = new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day), 
        parseInt(hour), 
        parseInt(minute),
        parseInt(second)
      )
    } else {
      endDate = new Date(endStr)
    }
  } else {
    // Dates are in UTC or other format - parse normally (will be adjusted to local by browser)
    startDate = new Date(startStr)
    endDate = new Date(endStr)
  }

  const color = getTimeSlotColor(startDate)

  return {
    id: booking.id,
    title: `${booking.client_name} - ${booking.num_guests} ospiti`,
    start: startDate,
    end: endDate,
    backgroundColor: color.bg,
    borderColor: color.border,
    textColor: color.text,
    extendedProps: booking,
  }
}

export const transformBookingsToCalendarEvents = (
  bookings: BookingRequest[]
): CalendarEvent[] => {
  return bookings
    .filter((b) => b.status === 'accepted' && b.confirmed_start && b.confirmed_end)
    .map(transformBookingToCalendarEvent)
}

