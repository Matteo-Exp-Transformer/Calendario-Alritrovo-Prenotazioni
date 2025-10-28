import { useMemo } from 'react'
import type { BookingRequest, TimeSlot, AvailabilityCheck } from '@/types/booking'
import { CAPACITY_CONFIG } from '../constants/capacity'

interface UseCapacityCheckParams {
  date: string
  startTime: string
  endTime: string
  numGuests: number
  acceptedBookings: BookingRequest[]
  excludeBookingId?: string
}

// Helper: parse time string to minutes
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Get slots occupied by a booking based on time strings (HH:MM format)
function getSlotsOccupiedByTimeString(startTime: string, endTime: string): TimeSlot[] {
  const startMinutes = parseTime(startTime)
  const endMinutes = parseTime(endTime)
  
  const morningStart = parseTime(CAPACITY_CONFIG.MORNING_START)
  const morningEnd = parseTime(CAPACITY_CONFIG.MORNING_END)
  const afternoonStart = parseTime(CAPACITY_CONFIG.AFTERNOON_START)
  const afternoonEnd = parseTime(CAPACITY_CONFIG.AFTERNOON_END)
  const eveningStart = parseTime(CAPACITY_CONFIG.EVENING_START)
  const eveningEnd = parseTime(CAPACITY_CONFIG.EVENING_END)

  const slots: TimeSlot[] = []

  // Check each slot range
  if (startMinutes <= morningEnd && endMinutes >= morningStart) {
    slots.push('morning')
  }
  if (startMinutes <= afternoonEnd && endMinutes >= afternoonStart) {
    slots.push('afternoon')
  }
  if (startMinutes <= eveningEnd || endMinutes >= eveningStart || (startMinutes >= eveningStart && endMinutes <= 1439)) {
    slots.push('evening')
  }

  return slots
}

export function useCapacityCheck(params: UseCapacityCheckParams): AvailabilityCheck {
  const { date, startTime, endTime, numGuests, acceptedBookings, excludeBookingId } = params

  return useMemo(() => {
    // Initialize slot capacities
    const morning = { slot: 'morning' as TimeSlot, capacity: CAPACITY_CONFIG.MORNING_CAPACITY, occupied: 0, available: CAPACITY_CONFIG.MORNING_CAPACITY }
    const afternoon = { slot: 'afternoon' as TimeSlot, capacity: CAPACITY_CONFIG.AFTERNOON_CAPACITY, occupied: 0, available: CAPACITY_CONFIG.AFTERNOON_CAPACITY }
    const evening = { slot: 'evening' as TimeSlot, capacity: CAPACITY_CONFIG.EVENING_CAPACITY, occupied: 0, available: CAPACITY_CONFIG.EVENING_CAPACITY }

    // Get bookings for the same date
    const dayBookings = acceptedBookings.filter((booking) => {
      if (booking.id === excludeBookingId) return false
      if (!booking.confirmed_start) return false
      const bookingDate = new Date(booking.confirmed_start).toISOString().split('T')[0]
      return bookingDate === date
    })

    // Calculate occupied seats for each slot
    for (const booking of dayBookings) {
      if (!booking.confirmed_start || !booking.confirmed_end) continue
      
      // Extract time directly from ISO string to avoid timezone issues
      const startTimeMatch = booking.confirmed_start.match(/T(\d{2}):(\d{2}):(\d{2})/)
      const endTimeMatch = booking.confirmed_end.match(/T(\d{2}):(\d{2}):(\d{2})/)
      
      let startTimeStr: string
      let endTimeStr: string
      
      if (startTimeMatch && endTimeMatch) {
        startTimeStr = `${startTimeMatch[1]}:${startTimeMatch[2]}`
        endTimeStr = `${endTimeMatch[1]}:${endTimeMatch[2]}`
      } else {
        // Fallback to old method
        startTimeStr = booking.confirmed_start.split('T')[1].substring(0, 5)
        endTimeStr = booking.confirmed_end.split('T')[1].substring(0, 5)
      }
      
      const slots = getSlotsOccupiedByTimeString(startTimeStr, endTimeStr)
      const guests = booking.num_guests || 0

      for (const slot of slots) {
        if (slot === 'morning') morning.occupied += guests
        else if (slot === 'afternoon') afternoon.occupied += guests
        else if (slot === 'evening') evening.occupied += guests
      }
    }

    // Update available seats
    morning.available = Math.max(0, morning.capacity - morning.occupied)
    afternoon.available = Math.max(0, afternoon.capacity - afternoon.occupied)
    evening.available = Math.max(0, evening.capacity - evening.occupied)

    // If no date/time selected, return available
    if (!date || !startTime || !endTime || numGuests === 0) {
      return { isAvailable: true, slotsStatus: [morning, afternoon, evening] }
    }

    // Calculate which slots the new booking would occupy
    const newBookingSlots = getSlotsOccupiedByTimeString(startTime, endTime)
    
    // Check if there's enough capacity in all affected slots
    let isAvailable = true
    const errorMessages: string[] = []

    for (const slot of newBookingSlots) {
      const slotData = slot === 'morning' ? morning : slot === 'afternoon' ? afternoon : evening
      
      if (slotData.available < numGuests) {
        isAvailable = false
        const slotName = slot === 'morning' ? 'mattina' : slot === 'afternoon' ? 'pomeriggio' : 'sera'
        errorMessages.push(
          `Fascia ${slotName}: ${slotData.available} posti disponibili su ${slotData.capacity} (richiesti: ${numGuests})`
        )
      }
    }

    return {
      isAvailable,
      slotsStatus: [morning, afternoon, evening],
      errorMessage: errorMessages.length > 0 ? errorMessages.join('\n') : undefined,
    }
  }, [date, startTime, endTime, numGuests, acceptedBookings, excludeBookingId])
}
