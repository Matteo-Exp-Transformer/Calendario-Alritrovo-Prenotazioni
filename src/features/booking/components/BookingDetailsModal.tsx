import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Users, Clock, Calendar, Edit, Trash2, Save, UtensilsCrossed } from 'lucide-react'
import { useUpdateBooking, useCancelBooking } from '../hooks/useBookingMutations'
import type { BookingRequest } from '@/types/booking'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { createBookingDateTime } from '../utils/dateUtils'

interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRequest
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  drink_caraffe: '🥤 Drink/Caraffe',
  drink_rinfresco_leggero: '🥤 Drink/Caraffe + rinfresco leggero',
  drink_rinfresco_completo: '🥤 Drink/Caraffe + rinfresco completo',
  drink_rinfresco_completo_primo: '🥤 Drink/Caraffe + rinfresco completo + primo piatto',
  menu_pranzo_cena: '🍽️ Menu Pranzo / Menù Cena',
}

const EVENT_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  drink_caraffe: { 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    text: 'text-blue-700',
    icon: '🥤'
  },
  drink_rinfresco_leggero: { 
    bg: 'bg-cyan-50', 
    border: 'border-cyan-200', 
    text: 'text-cyan-700',
    icon: '🥤'
  },
  drink_rinfresco_completo: { 
    bg: 'bg-teal-50', 
    border: 'border-teal-200', 
    text: 'text-teal-700',
    icon: '🥤'
  },
  drink_rinfresco_completo_primo: { 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    text: 'text-emerald-700',
    icon: '🥤'
  },
  menu_pranzo_cena: { 
    bg: 'bg-amber-50', 
    border: 'border-amber-200', 
    text: 'text-amber-700',
    icon: '🍽️'
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
      menu: booking.menu || '',
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
      menu: booking.menu || '',
    })
  }, [booking.id, booking.confirmed_start, booking.confirmed_end, booking.num_guests, booking.special_requests, booking.menu])

  const handleSave = () => {
    if (!booking.confirmed_start) return

    // Create ISO strings handling midnight crossover
    const confirmedStart = createBookingDateTime(formData.date, formData.startTime, true)
    const confirmedEnd = createBookingDateTime(formData.date, formData.endTime, false, formData.startTime)

    updateMutation.mutate(
      {
        bookingId: booking.id,
        confirmedStart,
        confirmedEnd,
        numGuests: formData.numGuests,
        specialRequests: formData.specialRequests,
        menu: formData.menu,
      },
      {
        onSuccess: (updatedBooking) => {
          console.log('✅ [BookingDetailsModal] Save successful:', updatedBooking)
          setIsEditMode(false)
          // Modal rimane aperto, i dati si aggiornano automaticamente tramite useEffect
        },
        onError: (error) => {
          console.error('❌ [BookingDetailsModal] Save failed:', error)
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

  const eventConfig = EVENT_TYPE_COLORS[booking.event_type] || EVENT_TYPE_COLORS.drink_caraffe

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
        className="absolute right-0 top-0 bottom-0 w-full max-w-md shadow-2xl overflow-y-auto flex flex-col"
        style={{
          position: 'absolute',
          backgroundColor: '#FEF3C7' // bg-amber-100
        }}
      >
        {/* Header */}
        <div className={`${eventConfig.bg} border-b ${eventConfig.border} p-3`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`p-3 ${eventConfig.bg} rounded-lg border ${eventConfig.border}`}>
                <span className="text-2xl">{eventConfig.icon}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {EVENT_TYPE_LABELS[booking.event_type]}
                </h2>
                <p className="text-sm text-gray-600">
                  Prenotazione #{booking.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:scale-110 shadow-sm border border-gray-300 bg-white"
            >
              <X className="h-5 w-5 text-gray-600" />
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
        <div className="flex-1 overflow-y-auto p-3 bg-amber-100">
          {!showCancelConfirm && (
            <div className="space-y-6">
              {/* Sezione Header */}
              <div className="border-b-2 border-gray-100 pb-4">
                <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-3 text-gray-600" />
                  Informazioni Cliente
                </h3>
              </div>

              {/* Client Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 py-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Nome</p>
                    <p className="text-base font-normal text-gray-900">{booking.client_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 py-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Email</p>
                    <p className="text-base font-normal text-gray-900">{booking.client_email}</p>
                  </div>
                </div>
                {booking.client_phone && (
                  <div className="flex items-center space-x-3 py-2">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Telefono</p>
                      <p className="text-base font-normal text-gray-900">{booking.client_phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-100 my-6"></div>

              {/* Sezione Header Event Details */}
              <div className="border-b-2 border-gray-100 pb-4">
                <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-gray-600" />
                  Dettagli Evento
                </h3>
              </div>

              {/* Event Details Content */}
              <div>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Menù</label>
                      <textarea
                        value={formData.menu}
                        onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                        rows={4}
                        placeholder="Es: Primi €15, Secondi €20..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-al-ritrovo-primary focus:border-transparent"
                      />
                    </div>
                    {booking.menu && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Menù (solo visualizzazione)</label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                          {booking.menu}
                        </div>
                      </div>
                    )}
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
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 py-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Data e Ora</p>
                        <p className="text-base font-normal text-gray-900">{formatDateTime(booking.confirmed_start)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 py-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Fine Evento</p>
                        <p className="text-base font-normal text-gray-900">{formatDateTime(booking.confirmed_end)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 py-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Numero Ospiti</p>
                        <p className="text-base font-normal text-gray-900">{booking.num_guests} persone</p>
                      </div>
                    </div>
                    {booking.menu && (
                      <div className="flex items-start space-x-3 py-2">
                        <UtensilsCrossed className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Menù</p>
                          <p className="text-base font-normal text-gray-900 whitespace-pre-wrap">{booking.menu}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {booking.special_requests && (
                <div>
                  <div className="border-t-2 border-gray-100 my-6"></div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                      📝 Note Speciali
                    </h4>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {booking.special_requests}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showCancelConfirm && (
          <div className="border-t border-gray-200 p-3 bg-amber-100">
            <div className="flex gap-3">
              {isEditMode ? (
                <>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all shadow hover:shadow-md flex items-center justify-center gap-2 font-semibold text-base"
                  >
                    <X className="h-5 w-5" />
                    Annulla
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-al-ritrovo-primary text-white rounded-lg hover:bg-al-ritrovo-primary-dark transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-base"
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-5 w-5" />
                    {updateMutation.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 px-8 py-4 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 font-semibold text-base"
                    style={{ 
                      minHeight: '56px',
                      backgroundColor: '#60A5FA',
                      border: 'none'
                    }}
                  >
                    <Edit className="h-5 w-5" />
                    Modifica
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex-1 px-8 py-4 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 font-semibold text-base"
                    style={{ 
                      minHeight: '56px',
                      backgroundColor: '#EF4444',
                      border: 'none'
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                    Cancella
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation dialog overlay - renders on top of everything */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          {/* Dark overlay background */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60" 
            onClick={() => setShowCancelConfirm(false)}
          />
          
          {/* Confirmation dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border-2 border-red-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Conferma Cancellazione</h3>
                <p className="text-sm text-gray-600 mt-1">Questa azione non può essere annullata</p>
              </div>
            </div>
            
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ <strong>Attenzione!</strong> Stai per cancellare questa prenotazione.
              </p>
              <p className="text-sm text-red-700 mt-2">
                Questa azione non può essere annullata e il cliente riceverà una notifica email.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="h-5 w-5" />
                Annulla
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                disabled={cancelMutation.isPending}
              >
                <Trash2 className="h-5 w-5" />
                {cancelMutation.isPending ? 'Cancellazione...' : 'Conferma Cancellazione'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

