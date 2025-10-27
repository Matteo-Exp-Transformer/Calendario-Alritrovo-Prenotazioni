import React, { useState } from 'react'
import { Modal } from '@/components/ui'
import { useUpdateBooking, useCancelBooking } from '../hooks/useBookingMutations'
import type { BookingRequest } from '@/types/booking'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRequest
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  cena: '🍽️ Cena',
  aperitivo: '🥂 Aperitivo',
  evento: '🎉 Evento Privato',
  laurea: '🎓 Laurea',
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const updateMutation = useUpdateBooking()
  const cancelMutation = useCancelBooking()

  const [formData, setFormData] = useState({
    date: booking.confirmed_start ? format(new Date(booking.confirmed_start), 'yyyy-MM-dd') : '',
    startTime: booking.confirmed_start ? format(new Date(booking.confirmed_start), 'HH:mm') : '',
    endTime: booking.confirmed_end ? format(new Date(booking.confirmed_end), 'HH:mm') : '',
    numGuests: booking.num_guests,
    specialRequests: booking.special_requests || '',
  })

  const handleSave = () => {
    if (!booking.confirmed_start) return

    const confirmedStart = `${formData.date}T${formData.startTime}:00`
    const confirmedEnd = `${formData.date}T${formData.endTime}:00`

    updateMutation.mutate({
      bookingId: booking.id,
      confirmedStart,
      confirmedEnd,
      numGuests: formData.numGuests,
      specialRequests: formData.specialRequests,
    })

    setIsEditMode(false)
  }

  const handleCancelBooking = () => {
    cancelMutation.mutate({
      bookingId: booking.id,
      cancellationReason: 'Cancellato dall\'amministratore',
    })

    setShowCancelConfirm(false)
    onClose()
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Non specificato'
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: it })
    } catch {
      return dateStr
    }
  }

  console.log('🔍 BookingDetailsModal render - isOpen:', isOpen, 'booking:', booking)

  if (!isOpen) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifica Prenotazione' : 'Dettagli Prenotazione'}
      position="right"
    >
      {showCancelConfirm ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ⚠️ <strong>Attenzione!</strong> Stai per cancellare questa prenotazione.
              Questa azione non può essere annullata.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleCancelBooking}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancellazione...' : '✅ Conferma Cancellazione'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Client Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">👤 Informazioni Cliente</h3>
            <p className="text-sm text-gray-600">Nome: <span className="font-medium">{booking.client_name}</span></p>
            <p className="text-sm text-gray-600">Email: <span className="font-medium">{booking.client_email}</span></p>
            {booking.client_phone && (
              <p className="text-sm text-gray-600">Telefono: <span className="font-medium">{booking.client_phone}</span></p>
            )}
          </div>

          {/* Event Details */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">📅 Dettagli Evento</h3>
            <div className="space-y-3">
              {isEditMode ? (
                <>
                  <div>
                    <label className="text-sm text-gray-700">Data</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-700">Orario inizio</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Orario fine</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Ospiti</label>
                    <input
                      type="number"
                      min="1"
                      max="110"
                      value={formData.numGuests}
                      onChange={(e) => setFormData({ ...formData, numGuests: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Tipo: <span className="font-medium">{EVENT_TYPE_LABELS[booking.event_type]}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Data/Ora: <span className="font-medium">{formatDateTime(booking.confirmed_start)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Fine: <span className="font-medium">{formatDateTime(booking.confirmed_end)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Ospiti: <span className="font-medium">{booking.num_guests}</span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {booking.special_requests && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">📝 Note</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                {booking.special_requests}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-al-ritrovo-primary text-white rounded-md hover:bg-al-ritrovo-primary-dark transition-colors disabled:opacity-50"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Salvataggio...' : '💾 Salva Modifiche'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex-1 px-4 py-2 bg-al-ritrovo-primary text-white rounded-md hover:bg-al-ritrovo-primary-dark transition-colors"
                >
                  ✏️ Modifica
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  🗑️ Cancella Prenotazione
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

