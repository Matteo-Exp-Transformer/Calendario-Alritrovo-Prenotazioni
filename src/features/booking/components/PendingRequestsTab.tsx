import React from 'react'
import { usePendingBookings } from '../hooks/useBookingQueries'
import { useAcceptBooking, useRejectBooking } from '../hooks/useBookingMutations'
import { BookingRequestCard } from './BookingRequestCard'
import { toast } from 'react-toastify'
import type { BookingRequest } from '@/types/booking'

export const PendingRequestsTab: React.FC = () => {
  const { data: pendingBookings, isLoading, error, refetch } = usePendingBookings()
  const acceptMutation = useAcceptBooking()
  const rejectMutation = useRejectBooking()

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
    
    const confirmedStart = `${date}T${startTimeFormatted}:00`
    const confirmedEnd = `${date}T${endTimeFormatted}:00`
    
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

