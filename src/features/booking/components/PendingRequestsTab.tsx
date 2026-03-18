import React, { useState, useMemo } from 'react'
import { usePendingBookings, useAcceptedBookings } from '../hooks/useBookingQueries'
import { useAcceptBooking, useRejectBooking } from '../hooks/useBookingMutations'
import { BookingRequestCard } from './BookingRequestCard'
import { RejectBookingModal } from './RejectBookingModal'
import { CapacityWarningModal } from './CapacityWarningModal'
import { toast } from 'react-toastify'
import type { BookingRequest } from '@/types/booking'
import { getSlotsOccupiedByBooking } from '../utils/capacityCalculator'
import { CAPACITY_CONFIG } from '../constants/capacity'
import { createBookingDateTime, extractDateFromISO, calculateEndTimeFromStart } from '../utils/dateUtils'

export const PendingRequestsTab: React.FC = () => {
  const { data: pendingBookings, isLoading, error, refetch } = usePendingBookings()
  const { data: acceptedBookings = [] } = useAcceptedBookings()
  const acceptMutation = useAcceptBooking()
  const rejectMutation = useRejectBooking()

  // Stato per gestire il modal di rifiuto
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedBookingForReject, setSelectedBookingForReject] = useState<BookingRequest | null>(null)

  // Stato per gestire il modal di overbooking
  const [showOverbookingConfirm, setShowOverbookingConfirm] = useState(false)
  const [overbookingSlotInfo, setOverbookingSlotInfo] = useState<{
    slotName: string; totalOccupied: number; capacity: number; exceededBy: number
  } | null>(null)
  const [pendingAcceptData, setPendingAcceptData] = useState<{
    bookingId: string; confirmedStart: string; confirmedEnd: string;
    desiredTime: string; numGuests: number
  } | null>(null)

  // ✅ FIX: Deduplicazione prenotazioni pending per evitare visualizzazioni doppie
  // Usa Set per tracciare ID già visti e filtra duplicati
  const uniquePendingBookings = useMemo(() => {
    if (!pendingBookings) return []

    const seenIds = new Set<string>()
    return pendingBookings.filter((booking) => {
      if (seenIds.has(booking.id)) {
        return false // Filtra duplicato
      }
      seenIds.add(booking.id)
      return true // Mantieni primo occurrence
    })
  }, [pendingBookings])

  // Returns exceeded slot info if capacity would be exceeded, null if within capacity
  const getExceededSlotInfo = (
    booking: BookingRequest, startTime: string, endTime: string
  ): { slotName: string; totalOccupied: number; capacity: number; exceededBy: number } | null => {
    const date = booking.desired_date
    const numGuests = booking.num_guests || 0

    const dayBookings = acceptedBookings.filter((b) => {
      if (!b.confirmed_start) return false
      const bookingDate = extractDateFromISO(b.confirmed_start)
      return bookingDate === date
    })

    const confirmedStart = `${date}T${startTime}:00`
    const confirmedEnd = `${date}T${endTime}:00`
    const newBookingSlots = getSlotsOccupiedByBooking(confirmedStart, confirmedEnd)

    const morning = { capacity: CAPACITY_CONFIG.MORNING_CAPACITY, occupied: 0 }
    const afternoon = { capacity: CAPACITY_CONFIG.AFTERNOON_CAPACITY, occupied: 0 }
    const evening = { capacity: CAPACITY_CONFIG.EVENING_CAPACITY, occupied: 0 }

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

    for (const slot of newBookingSlots) {
      let occupied: number, capacity: number, slotName: string
      if (slot === 'morning') { occupied = morning.occupied; capacity = morning.capacity; slotName = 'mattina' }
      else if (slot === 'afternoon') { occupied = afternoon.occupied; capacity = afternoon.capacity; slotName = 'pomeriggio' }
      else if (slot === 'evening') { occupied = evening.occupied; capacity = evening.capacity; slotName = 'sera' }
      else continue

      const totalOccupied = occupied + numGuests
      if (totalOccupied > capacity) {
        return { slotName, totalOccupied, capacity, exceededBy: totalOccupied - capacity }
      }
    }

    return null
  }

  const handleAccept = (booking: BookingRequest) => {

    // ✅ VALIDAZIONE: desired_time deve essere presente
    if (!booking.desired_time || booking.desired_time.trim() === '') {
      console.error('❌ [PendingRequestsTab] No desired_time found for booking:', booking.id)
      toast.error('Errore: Orario di prenotazione non specificato. Impossibile accettare la prenotazione.')
      return
    }

    // Calcola i dati per l'accettazione usando la stessa logica del modale
    const date = booking.desired_date
    const startTime = booking.desired_time
    
    // Ensure time format is HH:mm (not HH:mm:ss)
    const startTimeFormatted = startTime.includes(':') 
      ? startTime.split(':').slice(0, 2).join(':') 
      : startTime
    const endTimeFormatted = calculateEndTimeFromStart(startTimeFormatted)
    
    // Create ISO strings handling midnight crossover
    const confirmedStart = createBookingDateTime(date, startTimeFormatted, true)
    const confirmedEnd = createBookingDateTime(date, endTimeFormatted, false, startTimeFormatted)
    // ✅ CHECK CAPACITY - show warning modal if exceeded, but never block
    const exceededInfo = getExceededSlotInfo(booking, startTimeFormatted, endTimeFormatted)

    if (exceededInfo) {
      // Store data for later use when user confirms via modal
      setPendingAcceptData({
        bookingId: booking.id,
        confirmedStart,
        confirmedEnd,
        desiredTime: startTimeFormatted,
        numGuests: booking.num_guests,
      })
      setOverbookingSlotInfo(exceededInfo)
      setShowOverbookingConfirm(true)
      return
    }

    acceptMutation.mutate(
      {
        bookingId: booking.id,
        confirmedStart,
        confirmedEnd,
        desiredTime: startTimeFormatted, // ✅ Preserva l'orario originale del cliente
        numGuests: booking.num_guests,
      },
      {
        onSuccess: async () => {
          toast.success('Prenotazione accettata con successo!')
          // Forza il refetch delle richieste pending
          await refetch()
        },
        onError: (error) => {
          console.error('❌ [PendingRequestsTab] Accept mutation error:', error)
          toast.error('Errore nell\'accettazione della prenotazione')
        },
      }
    )
  }

  // Apre il modal quando si clicca su "Rifiuta"
  const handleReject = (booking: BookingRequest) => {
    
    // Imposta entrambi gli stati contemporaneamente
    // React batching li applicherà insieme
    setSelectedBookingForReject(booking)
    setRejectModalOpen(true)
    
  }

  // Conferma il rifiuto con il motivo inserito dall'admin
  const handleRejectConfirm = async (rejectionReason: string) => {
    if (!selectedBookingForReject) {
      console.error('❌ [PendingRequestsTab] No booking selected for rejection')
      return
    }

    
    try {
      await rejectMutation.mutateAsync({
        bookingId: selectedBookingForReject.id,
        rejectionReason: rejectionReason || undefined,
      })
      
      toast.success('Prenotazione rifiutata con successo!')
      
      // Chiudi il modal e resetta lo stato
      setRejectModalOpen(false)
      setSelectedBookingForReject(null)
      
      // Forza il refetch delle richieste pending
      await refetch()
    } catch (error) {
      console.error('❌ [PendingRequestsTab] Reject mutation error:', error)
      toast.error('Errore nel rifiuto della prenotazione')
    }
  }

  // Chiude il modal senza confermare
  const handleRejectModalClose = () => {
    setRejectModalOpen(false)
    setSelectedBookingForReject(null)
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

  if (!uniquePendingBookings || uniquePendingBookings.length === 0) {
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
            📋 Richieste in Attesa ({uniquePendingBookings.length})
          </h3>
        </div>

      <div className="flex flex-col">
        {uniquePendingBookings.map((booking) => (
          <div key={booking.id} style={{ marginBottom: '24px' }}>
            <BookingRequestCard
              booking={booking}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </div>
        ))}
      </div>

      {/* Modal per overbooking (solo avviso, non blocca) */}
      {overbookingSlotInfo && (
        <CapacityWarningModal
          isOpen={showOverbookingConfirm}
          onClose={() => {
            setShowOverbookingConfirm(false)
            setOverbookingSlotInfo(null)
            setPendingAcceptData(null)
          }}
          onConfirm={() => {
            if (pendingAcceptData) {
              acceptMutation.mutate(
                {
                  bookingId: pendingAcceptData.bookingId,
                  confirmedStart: pendingAcceptData.confirmedStart,
                  confirmedEnd: pendingAcceptData.confirmedEnd,
                  desiredTime: pendingAcceptData.desiredTime,
                  numGuests: pendingAcceptData.numGuests,
                },
                {
                  onSuccess: async () => {
                    toast.success('Prenotazione accettata con successo!')
                    await refetch()
                  },
                  onError: (error) => {
                    console.error('❌ [PendingRequestsTab] Accept mutation error:', error)
                    toast.error('Errore nell\'accettazione della prenotazione')
                  },
                }
              )
            }
            setShowOverbookingConfirm(false)
            setOverbookingSlotInfo(null)
            setPendingAcceptData(null)
          }}
          onCancel={() => {
            setShowOverbookingConfirm(false)
            setOverbookingSlotInfo(null)
            setPendingAcceptData(null)
          }}
          exceededBy={overbookingSlotInfo.exceededBy}
          slotName={overbookingSlotInfo.slotName}
          totalOccupied={overbookingSlotInfo.totalOccupied}
          capacity={overbookingSlotInfo.capacity}
          variant="new_booking"
        />
      )}

      {/* Modal per il rifiuto con motivo */}
      <RejectBookingModal
        isOpen={rejectModalOpen}
        onClose={handleRejectModalClose}
        booking={selectedBookingForReject}
        onConfirm={handleRejectConfirm}
        isLoading={rejectMutation.isPending}
      />
      
    </div>
  )
}

