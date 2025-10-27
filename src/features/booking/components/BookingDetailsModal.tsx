import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Users, Clock, Calendar, Edit, Trash2, Save } from 'lucide-react'
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

const EVENT_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  cena: { 
    bg: 'bg-red-50', 
    border: 'border-red-200', 
    text: 'text-red-700',
    icon: '🍽️'
  },
  aperitivo: { 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200', 
    text: 'text-yellow-700',
    icon: '🥂'
  },
  evento: { 
    bg: 'bg-purple-50', 
    border: 'border-purple-200', 
    text: 'text-purple-700',
    icon: '🎉'
  },
  laurea: { 
    bg: 'bg-teal-50', 
    border: 'border-teal-200', 
    text: 'text-teal-700',
    icon: '🎓'
  },
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

  const [formData, setFormData] = useState(() => {
    return {
      date: booking.confirmed_start ? format(new Date(booking.confirmed_start), 'yyyy-MM-dd') : '',
      startTime: booking.confirmed_start ? format(new Date(booking.confirmed_start), 'HH:mm') : '',
      endTime: booking.confirmed_end ? format(new Date(booking.confirmed_end), 'HH:mm') : '',
      numGuests: booking.num_guests,
      specialRequests: booking.special_requests || '',
    }
  })

  // Aggiorna formData quando cambia il booking
  useEffect(() => {
    setFormData({
      date: booking.confirmed_start ? format(new Date(booking.confirmed_start), 'yyyy-MM-dd') : '',
      startTime: booking.confirmed_start ? format(new Date(booking.confirmed_start), 'HH:mm') : '',
      endTime: booking.confirmed_end ? format(new Date(booking.confirmed_end), 'HH:mm') : '',
      numGuests: booking.num_guests,
      specialRequests: booking.special_requests || '',
    })
  }, [booking.id, booking.confirmed_start, booking.confirmed_end, booking.num_guests, booking.special_requests])

  const handleSave = () => {
    if (!booking.confirmed_start) return

    const confirmedStart = `${formData.date}T${formData.startTime}:00`
    const confirmedEnd = `${formData.date}T${formData.endTime}:00`

    updateMutation.mutate(
      {
        bookingId: booking.id,
        confirmedStart,
        confirmedEnd,
        numGuests: formData.numGuests,
        specialRequests: formData.specialRequests,
      },
      {
        onSuccess: () => {
          setIsEditMode(false)
          // Modal rimane aperto, i dati si aggiornano automaticamente
        },
      }
    )
  }

  const handleCancelBooking = () => {
    cancelMutation.mutate(
      {
        bookingId: booking.id,
        cancellationReason: 'Cancellato dall\'amministratore',
      },
      {
        onSuccess: () => {
          setShowCancelConfirm(false)
          // Chiudi il modal dopo la cancellazione (la prenotazione non esiste più)
          onClose()
        },
      }
    )
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Non specificato'
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: it })
    } catch {
      return dateStr
    }
  }

  if (!isOpen) {
    return null
  }

  const eventConfig = EVENT_TYPE_COLORS[booking.event_type] || EVENT_TYPE_COLORS.cena

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999 
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{ 
          backgroundColor: '#ffffff',
          position: 'absolute'
        }}
      >
        {/* Header */}
        <div className={`${eventConfig.bg} border-b ${eventConfig.border} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 ${eventConfig.bg} rounded-lg border ${eventConfig.border}`}>
                <span className="text-2xl">{eventConfig.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {EVENT_TYPE_LABELS[booking.event_type]}
                </h2>
                <p className="text-sm text-gray-600">
                  Prenotazione #{booking.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ Confermata
            </span>
            {booking.special_requests && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                📝 Con note
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={cancelMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  {cancelMutation.isPending ? 'Cancellazione...' : 'Conferma Cancellazione'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informazioni Cliente
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Nome</p>
                      <p className="font-medium text-gray-900">{booking.client_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{booking.client_email}</p>
                    </div>
                  </div>
                  {booking.client_phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Telefono</p>
                        <p className="font-medium text-gray-900">{booking.client_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Dettagli Evento
                </h3>
                
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-al-ritrovo-primary focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Orario inizio</label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-al-ritrovo-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Orario fine</label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-al-ritrovo-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ospiti</label>
                      <input
                        type="number"
                        min="1"
                        max="110"
                        value={formData.numGuests}
                        onChange={(e) => setFormData({ ...formData, numGuests: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-al-ritrovo-primary focus:border-transparent"
                      />
                    </div>
                    {booking.special_requests && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note Speciali</label>
                        <textarea
                          value={formData.specialRequests}
                          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-al-ritrovo-primary focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Data e Ora</p>
                        <p className="font-medium text-gray-900">{formatDateTime(booking.confirmed_start)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Fine Evento</p>
                        <p className="font-medium text-gray-900">{formatDateTime(booking.confirmed_end)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Numero Ospiti</p>
                        <p className="font-medium text-gray-900">{booking.num_guests} persone</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {booking.special_requests && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                    📝 Note Speciali
                  </h4>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">
                    {booking.special_requests}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showCancelConfirm && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Annulla
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-al-ritrovo-primary text-white rounded-md hover:bg-al-ritrovo-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 px-4 py-2 bg-al-ritrovo-primary text-white rounded-md hover:bg-al-ritrovo-primary-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Modifica
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancella
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

