import React from 'react'
import type { BookingRequest } from '@/types/booking'
import { Button } from '@/components/ui'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface BookingRequestCardProps {
  booking: BookingRequest
  onAccept: (booking: BookingRequest) => void
  onReject: (booking: BookingRequest) => void
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  cena: '🍽️ Cena',
  aperitivo: '🥂 Aperitivo',
  evento: '🎉 Evento Privato',
  laurea: '🎓 Laurea',
}

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  booking,
  onAccept,
  onReject,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMMM yyyy', { locale: it })
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Non specificato'
    return timeStr
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-status-pending">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              👤 {booking.client_name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              📧 {booking.client_email}
            </p>
            {booking.client_phone && (
              <p className="text-sm text-gray-500">📞 {booking.client_phone}</p>
            )}
          </div>
          <span className="px-3 py-1 bg-status-pending/10 text-status-pending rounded-full text-sm font-medium">
            Pendente
          </span>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">📅 Data richiesta</p>
            <p className="font-medium">{formatDate(booking.desired_date)}</p>
          </div>
          <div>
            <p className="text-gray-500">⏰ Orario richiesto</p>
            <p className="font-medium">{formatTime(booking.desired_time)}</p>
          </div>
        </div>

        {/* Event Type & Guests */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">🎉 Tipo evento</p>
            <p className="font-medium">
              {EVENT_TYPE_LABELS[booking.event_type] || booking.event_type}
            </p>
          </div>
          <div>
            <p className="text-gray-500">👥 Ospiti</p>
            <p className="font-medium">{booking.num_guests} persone</p>
          </div>
        </div>

        {/* Special Requests */}
        {booking.special_requests && (
          <div>
            <p className="text-gray-500 text-sm">📝 Note</p>
            <p className="text-gray-900 bg-gray-50 p-3 rounded border text-sm">
              {booking.special_requests}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="primary"
            onClick={() => onAccept(booking)}
            className="flex-1"
          >
            ✅ ACCETTA
          </Button>
          <Button
            variant="danger"
            onClick={() => onReject(booking)}
            className="flex-1"
          >
            ❌ RIFIUTA
          </Button>
        </div>
      </div>
    </div>
  )
}

