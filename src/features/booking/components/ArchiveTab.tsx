import React, { useState } from 'react'
import { useAllBookings } from '../hooks/useBookingQueries'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, Users, Tag, Mail, Phone, MessageSquare, ChevronDown, ChevronUp, User, UtensilsCrossed, Wine, PartyPopper, GraduationCap } from 'lucide-react'

type ArchiveFilter = 'all' | 'accepted' | 'rejected'

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  cena: { label: 'Cena', icon: UtensilsCrossed, color: 'bg-booking-cena' },
  aperitivo: { label: 'Aperitivo', icon: Wine, color: 'bg-booking-aperitivo' },
  evento: { label: 'Evento Privato', icon: PartyPopper, color: 'bg-booking-evento' },
  laurea: { label: 'Laurea', icon: GraduationCap, color: 'bg-booking-laurea' },
}

const STATUS_LABELS: Record<string, { label: string; bgColor: string; textColor: string }> = {
  pending: { label: 'Pendente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  accepted: { label: 'Accettata', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  rejected: { label: 'Rifiutata', bgColor: 'bg-red-100', textColor: 'text-red-800' },
}

interface ArchiveBookingCardProps {
  booking: any
}

const ArchiveBookingCard: React.FC<ArchiveBookingCardProps> = ({ booking }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMMM yyyy', { locale: it })
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMMM yyyy HH:mm', { locale: it })
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Non specificato'
    return timeStr
  }

  const eventConfig = EVENT_TYPE_CONFIG[booking.event_type] || EVENT_TYPE_CONFIG.cena
  const EventIcon = eventConfig.icon
  const statusConfig = STATUS_LABELS[booking.status] || STATUS_LABELS.pending

  const displayDate = booking.confirmed_start || booking.desired_date
  const displayTime = booking.desired_time || 'Non specificato'

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-200 overflow-hidden transition-all duration-300">
      {/* Header Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icona Tipo Evento */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${eventConfig.color} shadow-md flex-shrink-0`}>
              <EventIcon className="w-8 h-8 text-white" />
            </div>

            {/* Info Principali */}
            <div className="text-left flex-1 space-y-3">
              {/* Riga 1: Tipo + Cliente */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span className="text-lg font-bold text-indigo-900">{eventConfig.label}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-gray-900">{booking.client_name}</span>
                </div>
              </div>

              {/* Riga 2: Data, Ora, Ospiti */}
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-gray-900">{formatDate(displayDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-gray-900">{formatTime(displayTime)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-gray-900">{booking.num_guests} ospiti</span>
                </div>
              </div>

              {/* Riga 3: Created Date */}
              <div className="text-xs text-gray-500">
                Creata: {formatDateTime(booking.created_at)}
              </div>
            </div>
          </div>

          {/* Badge Status + Chevron */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-indigo-600" />
            ) : (
              <ChevronDown className="w-6 h-6 text-indigo-600" />
            )}
          </div>
        </div>
      </button>

      {/* Contenuto Espandibile */}
      {isExpanded && (
        <div className="p-6 space-y-4 bg-white border-t-2 border-indigo-100 animate-slideDown">
          {/* Dati Cliente */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-indigo-900" />
              <h4 className="text-lg font-bold text-indigo-900">Dati Cliente</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-base font-semibold text-gray-900">{booking.client_email}</p>
                </div>
              </div>

              {booking.client_phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Telefono</p>
                    <p className="text-base font-semibold text-gray-900">{booking.client_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note se presenti */}
          {booking.special_requests && (
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Richieste Speciali</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{booking.special_requests}</p>
                </div>
              </div>
            </div>
          )}

          {/* Motivo rifiuto se presente */}
          {booking.rejection_reason && (
            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Motivo Rifiuto</p>
                  <p className="text-sm text-red-700 leading-relaxed">{booking.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
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
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-indigo-100">
        <label className="text-sm font-bold text-indigo-900 block mb-3 uppercase tracking-wide">
          Filtra per status:
        </label>
        <div className="flex gap-3">
          {(['all', 'accepted', 'rejected'] as ArchiveFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-indigo-100 hover:scale-105 shadow-md'
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
          <p className="text-sm font-bold text-indigo-900 bg-indigo-50 rounded-lg px-4 py-2 inline-block">
            📊 Mostrando {filteredBookings.length} prenotazioni
          </p>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-12 text-center border-2 border-purple-100">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-indigo-900 mb-2">
              Nessuna prenotazione {filter !== 'all' && `con status "${filter}"`}
            </h3>
            <p className="text-gray-600 font-medium">
              {filter === 'all'
                ? 'Nessuna prenotazione presente nell\'archivio.'
                : 'Prova a cambiare il filtro.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => {
              return <ArchiveBookingCard key={booking.id} booking={booking} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

