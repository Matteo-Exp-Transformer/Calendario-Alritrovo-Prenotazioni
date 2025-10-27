import React, { useState } from 'react'
import { usePendingBookings } from '../hooks/useBookingQueries'
import { useAcceptBooking, useRejectBooking } from '../hooks/useBookingMutations'
import { BookingRequestCard } from './BookingRequestCard'
import { AcceptBookingModal } from './AcceptBookingModal'
import { RejectBookingModal } from './RejectBookingModal'
import type { BookingRequest } from '@/types/booking'

export const PendingRequestsTab: React.FC = () => {
  const { data: pendingBookings, isLoading, error } = usePendingBookings()
  const acceptMutation = useAcceptBooking()
  const rejectMutation = useRejectBooking()

  const [acceptingBooking, setAcceptingBooking] = useState<BookingRequest | null>(null)
  const [rejectingBooking, setRejectingBooking] = useState<BookingRequest | null>(null)

  const handleAccept = (booking: BookingRequest) => {
    console.log('🔵 [PendingRequestsTab] handleAccept called with:', booking)
    setAcceptingBooking(booking)
    console.log('🔵 [PendingRequestsTab] Setting acceptingBooking to:', booking.id)
  }

  const handleReject = (booking: BookingRequest) => {
    setRejectingBooking(booking)
  }

  const handleConfirmAccept = (data: {
    confirmedStart: string
    confirmedEnd: string
    numGuests: number
  }) => {
    console.log('🔵 [PendingRequestsTab] handleConfirmAccept called with:', data)
    console.log('🔵 [PendingRequestsTab] acceptingBooking:', acceptingBooking)
    
    if (!acceptingBooking) {
      console.error('❌ [PendingRequestsTab] No acceptingBooking set!')
      return
    }

    console.log('🔵 [PendingRequestsTab] Calling acceptMutation.mutate...')
    acceptMutation.mutate({
      bookingId: acceptingBooking.id,
      confirmedStart: data.confirmedStart,
      confirmedEnd: data.confirmedEnd,
      numGuests: data.numGuests,
    })
    
    console.log('✅ [PendingRequestsTab] Mutation called, resetting acceptingBooking')
    setAcceptingBooking(null)
  }

  const handleConfirmReject = (reason: string) => {
    if (!rejectingBooking) return

    rejectMutation.mutate({
      bookingId: rejectingBooking.id,
      rejectionReason: reason,
    })

    setRejectingBooking(null)
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
        <p className="text-sm text-gray-500">
          Clicca su ACCETTA o RIFIUTA per gestire le prenotazioni
        </p>
      </div>

      <div className="grid gap-4">
        {pendingBookings.map((booking) => (
          <BookingRequestCard
            key={booking.id}
            booking={booking}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
      </div>

      {/* Modals */}
      <AcceptBookingModal
        isOpen={!!acceptingBooking}
        onClose={() => setAcceptingBooking(null)}
        booking={acceptingBooking}
        onConfirm={handleConfirmAccept}
        isLoading={acceptMutation.isPending}
      />

      <RejectBookingModal
        isOpen={!!rejectingBooking}
        onClose={() => setRejectingBooking(null)}
        booking={rejectingBooking}
        onConfirm={handleConfirmReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  )
}

