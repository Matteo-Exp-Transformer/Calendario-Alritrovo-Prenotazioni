import React from 'react'
import { usePendingBookings, useAcceptedBookings } from '../hooks/useBookingQueries'
import { useAcceptBooking, useRejectBooking } from '../hooks/useBookingMutations'
import { BookingRequestCard } from './BookingRequestCard'
import { toast } from 'react-toastify'
import type { BookingRequest } from '@/types/booking'
import { getSlotsOccupiedByBooking } from '../utils/capacityCalculator'
import { CAPACITY_CONFIG } from '../constants/capacity'
import { createBookingDateTime } from '../utils/dateUtils'

export const PendingRequestsTab: React.FC = () => {
  const { data: pendingBookings, isLoading, error, refetch } = usePendingBookings()
  const { data: acceptedBookings = [] } = useAcceptedBookings()
  const acceptMutation = useAcceptBooking()
  const rejectMutation = useRejectBooking()

  // Function to check if there are enough seats available
  const checkCapacity = (booking: BookingRequest, startTime: string, endTime: string): boolean => {
    const date = booking.desired_date
    const numGuests = booking.num_guests || 0
    
    // Get accepted bookings for this date
    const dayBookings = acceptedBookings.filter((b) => {
      if (!b.confirmed_start) return false
      const bookingDate = new Date(b.confirmed_start).toISOString().split('T')[0]
      return bookingDate === date
    })

    // Build the confirmed dates
    const confirmedStart = `${date}T${startTime}:00`
    const confirmedEnd = `${date}T${endTime}:00`

    // Get which slots this new booking would occupy
    const newBookingSlots = getSlotsOccupiedByBooking(confirmedStart, confirmedEnd)
    
    // Initialize slot capacities
    const morning: { capacity: number; occupied: number } = { 
      capacity: CAPACITY_CONFIG.MORNING_CAPACITY, 
      occupied: 0 
    }
    const afternoon: { capacity: number; occupied: number } = { 
      capacity: CAPACITY_CONFIG.AFTERNOON_CAPACITY, 
      occupied: 0 
    }
    const evening: { capacity: number; occupied: number } = { 
      capacity: CAPACITY_CONFIG.EVENING_CAPACITY, 
      occupied: 0 
    }

    // Calculate occupied seats for each slot from existing bookings
    for (const existingBooking of dayBookings) {
      if (!existingBooking.confirmed_start || !existingBooking.confirmed_end) continue
      
      const slots = getSlotsOccupiedByBooking(existingBooking.confirmed_start, existingBooking.confirmed_end)
      const guests = existingBooking.num_guests || 0

      for (const slot of slots) {
        if (slot === 'morning') morning.occupied += guests
        else if (slot === 'afternoon') afternoon.occupied += guests
        else if (slot === 'evening') evening.occupied += guests
      }
    }

    // Check if new booking would exceed capacity in any slot
    for (const slot of newBookingSlots) {
      let available: number
      
      if (slot === 'morning') {
        available = morning.capacity - morning.occupied
      } else if (slot === 'afternoon') {
        available = afternoon.capacity - afternoon.occupied
      } else if (slot === 'evening') {
        available = evening.capacity - evening.occupied
      } else {
        continue // Unknown slot
      }

      // If not enough seats available in this slot
      if (available < numGuests) {
        return false
      }
    }

    return true
  }

  const handleAccept = (booking: BookingRequest) => {
    console.log('🔵 [PendingRequestsTab] handleAccept called with:', booking)
    
    // Calcola i dati per l'accettazione usando la stessa logica del modale
    const date = booking.desired_date
    const startTime = booking.desired_time || '20:00'
    
    // Calculate end time (default +3 hours)
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = (hours + 3) % 24
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    
    // Ensure time format is HH:mm (not HH:mm:ss)
    const startTimeFormatted = startTime.includes(':') 
      ? startTime.split(':').slice(0, 2).join(':') 
      : startTime
    const endTimeFormatted = endTime.includes(':')
      ? endTime.split(':').slice(0, 2).join(':')
      : endTime
    
    // Create ISO strings handling midnight crossover
    const confirmedStart = createBookingDateTime(date, startTimeFormatted, true)
    const confirmedEnd = createBookingDateTime(date, endTimeFormatted, false, startTimeFormatted)
    
    // ✅ CHECK CAPACITY BEFORE ACCEPTING
    console.log('🔵 [PendingRequestsTab] Checking capacity before accepting...')
    const hasCapacity = checkCapacity(booking, startTimeFormatted, endTimeFormatted)
    
    if (!hasCapacity) {
      console.error('❌ [PendingRequestsTab] Not enough seats available!')
      toast.error(`❌ Posti non disponibili! La prenotazione richiede ${booking.num_guests} posti ma non ci sono abbastanza posti liberi nella fascia oraria selezionata.`)
      return
    }
    
    console.log('✅ [PendingRequestsTab] Capacity check passed!')
    
    console.log('🔵 [PendingRequestsTab] Submitting with:', {
      confirmedStart,
      confirmedEnd,
      numGuests: booking.num_guests,
    })
    
    console.log('🔵 [PendingRequestsTab] Calling acceptMutation.mutate...')
    acceptMutation.mutate(
      {
        bookingId: booking.id,
        confirmedStart,
        confirmedEnd,
        numGuests: booking.num_guests,
      },
      {
        onSuccess: async () => {
          console.log('✅ [PendingRequestsTab] Accept mutation success')
          toast.success('Prenotazione accettata con successo!')
          // Forza il refetch delle richieste pending
          await refetch()
          console.log('✅ [PendingRequestsTab] Pending bookings refetched')
        },
        onError: (error) => {
          console.error('❌ [PendingRequestsTab] Accept mutation error:', error)
          toast.error('Errore nell\'accettazione della prenotazione')
        },
      }
    )
  }

  const handleReject = async (booking: BookingRequest) => {
    console.log('🔵 [PendingRequestsTab] handleReject called with:', booking.id)
    
    try {
      await rejectMutation.mutateAsync({
        bookingId: booking.id,
        rejectionReason: 'Rifiutata dall\'amministratore',
      })
      
      console.log('✅ [PendingRequestsTab] Reject mutation success')
      toast.success('Prenotazione rifiutata con successo!')
      
      // Forza il refetch delle richieste pending
      await refetch()
      console.log('✅ [PendingRequestsTab] Pending bookings refetched')
    } catch (error) {
      console.error('❌ [PendingRequestsTab] Reject mutation error:', error)
      toast.error('Errore nel rifiuto della prenotazione')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-al-ritrovo-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento richieste...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Errore nel caricamento delle richieste</p>
        <p className="text-red-600 text-sm mt-2">{String(error)}</p>
      </div>
    )
  }

  if (!pendingBookings || pendingBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nessuna richiesta in attesa
        </h3>
        <p className="text-gray-500">
          Non ci sono prenotazioni pendenti al momento.
        </p>
      </div>
    )
  }

  return (
      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            📋 Richieste in Attesa ({pendingBookings.length})
          </h3>
        </div>

      <div className="flex flex-col">
        {pendingBookings.map((booking) => (
          <div key={booking.id} style={{ marginBottom: '24px' }}>
            <BookingRequestCard
              booking={booking}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

