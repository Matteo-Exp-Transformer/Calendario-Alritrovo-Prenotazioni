import React, { useState } from 'react'
import { useAllBookings } from '../hooks/useBookingQueries'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

type ArchiveFilter = 'all' | 'accepted' | 'rejected'

const EVENT_TYPE_LABELS: Record<string, string> = {
  cena: '🍽️ Cena',
  aperitivo: '🥂 Aperitivo',
  evento: '🎉 Evento',
  laurea: '🎓 Laurea',
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: '⏳ Pendente', className: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: '✅ Accettata', className: 'bg-green-100 text-green-800' },
  rejected: { label: '❌ Rifiutata', className: 'bg-red-100 text-red-800' },
}

export const ArchiveTab: React.FC = () => {
  const { data: allBookings, isLoading, error } = useAllBookings()
  const [filter, setFilter] = useState<ArchiveFilter>('all')

  const filteredBookings = React.useMemo(() => {
    if (!allBookings) return []

    switch (filter) {
      case 'accepted':
        return allBookings.filter((b) => b.status === 'accepted')
      case 'rejected':
        return allBookings.filter((b) => b.status === 'rejected')
      default:
        return allBookings
    }
  }, [allBookings, filter])

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: it })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-al-ritrovo-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento archivio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Errore nel caricamento dell'archivio</p>
        <p className="text-red-600 text-sm mt-2">{String(error)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Filtra per status:
        </label>
        <div className="flex gap-2">
          {(['all', 'accepted', 'rejected'] as ArchiveFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-al-ritrovo-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all'
                ? '📚 Tutte'
                : f === 'accepted'
                ? '✅ Accettate'
                : '❌ Rifiutate'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Mostrando {filteredBookings.length} prenotazioni
          </p>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessuna prenotazione {filter !== 'all' && `con status "${filter}"`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'Nessuna prenotazione presente nell\'archivio.'
                : 'Prova a cambiare il filtro.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => {
              const statusInfo = STATUS_LABELS[booking.status] || STATUS_LABELS.pending
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-300 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Client Info */}
                    <div>
                      <p className="text-sm text-gray-500">Cliente</p>
                      <p className="font-semibold">{booking.client_name}</p>
                      <p className="text-sm text-gray-600">{booking.client_email}</p>
                      {booking.client_phone && (
                        <p className="text-sm text-gray-600">{booking.client_phone}</p>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div>
                      <p className="text-sm text-gray-500">Dettagli</p>
                      <p className="font-medium">
                        {EVENT_TYPE_LABELS[booking.event_type] || booking.event_type}
                      </p>
                      <p className="text-sm text-gray-600">{booking.num_guests} ospiti</p>
                      {booking.confirmed_start && (
                        <p className="text-sm text-gray-600">
                          📅 {formatDate(booking.confirmed_start)}
                        </p>
                      )}
                      {!booking.confirmed_start && booking.desired_date && (
                        <p className="text-sm text-gray-600">
                          📅 {formatDate(booking.desired_date)}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      {booking.rejection_reason && (
                        <p className="text-sm text-gray-600 mt-2">
                          Motivo: {booking.rejection_reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

