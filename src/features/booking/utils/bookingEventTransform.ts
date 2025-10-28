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
  
  // Always extract time components directly from ISO string to avoid timezone issues
  const startMatch = startStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
  const endMatch = endStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
  
  if (startMatch && endMatch) {
    // Extract time components directly from string to avoid timezone conversion
    const [, year, month, day, hour, minute, second] = startMatch
    startDate = new Date(
      parseInt(year), 
      parseInt(month) - 1, 
      parseInt(day), 
      parseInt(hour), 
      parseInt(minute),
      parseInt(second)
    )
    
    const [, endYear, endMonth, endDay, endHour, endMinute, endSecond] = endMatch
    endDate = new Date(
      parseInt(endYear), 
      parseInt(endMonth) - 1, 
      parseInt(endDay), 
      parseInt(endHour), 
      parseInt(endMinute),
      parseInt(endSecond)
    )
  } else {
    // Fallback to Date parsing if format doesn't match
    startDate = new Date(startStr)
    endDate = new Date(endStr)
  }

  console.log('🔍 [transformBookingToCalendarEvent]', {
    startStr,
    endStr,
    startDate: startDate.toISOString(),
    hour: startDate.getHours()
  })

  const color = getTimeSlotColor(startDate)

  const event: CalendarEvent = {
    id: booking.id,
    title: `${booking.client_name} - ${booking.num_guests} ospiti`,
    start: startDate,
    end: endDate,
    backgroundColor: color.bg,
    borderColor: color.border,
    extendedProps: booking,
  }
  
  if (color.text) {
    event.textColor = color.text
  }
  
  return event
}

export const transformBookingsToCalendarEvents = (
  bookings: BookingRequest[]
): CalendarEvent[] => {
  return bookings
    .filter((b) => b.status === 'accepted' && b.confirmed_start && b.confirmed_end)
    .map(transformBookingToCalendarEvent)
}

