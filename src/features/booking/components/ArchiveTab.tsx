import React, { useState } from 'react'
import { useAllBookings } from '../hooks/useBookingQueries'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, Users, Tag, Mail, Phone, MessageSquare, ChevronDown, ChevronUp, User, UtensilsCrossed, Wine, PartyPopper, GraduationCap, Archive, CheckCircle, XCircle } from 'lucide-react'
import { extractTimeFromISO } from '../utils/dateUtils'

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
  onViewInCalendar?: (date: string) => void
}

const ArchiveBookingCard: React.FC<ArchiveBookingCardProps> = ({ booking, onViewInCalendar }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'd MMMM yyyy', { locale: it })
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Non specificato'
    return timeStr.split(':').slice(0, 2).join(':')
  }

  const eventConfig = EVENT_TYPE_CONFIG[booking.event_type] || EVENT_TYPE_CONFIG.cena
  const EventIcon = eventConfig.icon
  const statusConfig = STATUS_LABELS[booking.status] || STATUS_LABELS.pending

  const displayDate = booking.confirmed_start || booking.desired_date
  // ✅ FIX: Per prenotazioni accettate, usa confirmed_start invece di desired_time
  // Questo preserva l'orario esatto inserito dall'utente senza conversioni timezone
  const displayTime = booking.confirmed_start
    ? extractTimeFromISO(booking.confirmed_start)
    : booking.desired_time || 'Non specificato'

  return (
    <div style={{
      background: 'linear-gradient(to bottom right, rgba(240, 244, 255, 0.9), rgba(224, 231, 255, 0.9), rgba(216, 220, 254, 0.9))',
      border: '3px solid rgba(129, 140, 248, 0.6)',
      boxShadow: '0 4px 12px -2px rgba(129, 140, 248, 0.2)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }} className="rounded-2xl hover:shadow-2xl transition-all duration-300 relative">
      {/* Header Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'linear-gradient(to right, #F0F4FF, #E0E7FF)' }}
        className="w-full p-6 hover:opacity-90 transition-all"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icona Tipo Evento */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${eventConfig.color} shadow-md flex-shrink-0`}>
              <EventIcon className="w-8 h-8 text-white" />
            </div>

            {/* Layout 2 colonne come BookingRequestCard */}
            <div className="text-left flex-1">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {/* Colonna Sinistra */}
                <div className="space-y-3">
                  {/* Tipo Evento */}
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-warm-orange flex-shrink-0" />
                    <span className="text-base font-bold text-warm-wood">{eventConfig.label}</span>
                  </div>

                  {/* Nome Cliente */}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-warm-orange flex-shrink-0" />
                    <span className="text-base font-semibold text-warm-wood-dark">{booking.client_name}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-warm-orange flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{booking.client_email}</span>
                  </div>

                  {/* Telefono */}
                  {booking.client_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-warm-orange flex-shrink-0" />
                      <span className="text-sm text-gray-600">{booking.client_phone}</span>
                    </div>
                  )}
                </div>

                {/* Colonna Destra */}
                <div className="space-y-3">
                  {/* Data */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-warm-orange flex-shrink-0" />
                    <span className="text-base font-semibold text-warm-wood-dark">{formatDate(displayDate)}</span>
                  </div>

                  {/* Ora */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warm-orange flex-shrink-0" />
                    <span className="text-base font-semibold text-warm-wood-dark">{formatTime(displayTime)}</span>
                  </div>

                  {/* Ospiti */}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-warm-orange flex-shrink-0" />
                    <span className="text-base font-semibold text-warm-wood-dark">{booking.num_guests} ospiti</span>
                  </div>

                  {/* Note preview se presenti */}
                  {booking.special_requests && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-warm-orange flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 line-clamp-2 italic">
                        {booking.special_requests}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Badge Status + Chevron */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${statusConfig.bgColor} ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-warm-wood" />
            ) : (
              <ChevronDown className="w-6 h-6 text-warm-wood" />
            )}
          </div>
        </div>
      </button>

      {/* Contenuto Espandibile */}
      {isExpanded && (
        <div className="p-4 md:p-6 bg-white border-t-2 border-warm-orange/10 animate-slideDown">
          {/* Dati Organizzati - Responsive: 1 colonna su mobile, 2 su desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 md:gap-y-3">
            {/* Nome */}
            <div className="flex flex-row items-start gap-3 py-1.5 md:py-2">
              <span className="text-xs text-gray-500 w-24 md:w-28 font-medium uppercase tracking-wide flex-shrink-0">Nome:</span>
              <span className="text-sm md:text-base font-semibold text-warm-wood-dark break-words">{booking.client_name}</span>
            </div>

            {/* Email */}
            <div className="flex flex-row items-start gap-3 py-1.5 md:py-2">
              <span className="text-xs text-gray-500 w-24 md:w-28 font-medium uppercase tracking-wide flex-shrink-0">Email:</span>
              <span className="text-sm md:text-base font-semibold text-warm-wood-dark break-all">{booking.client_email}</span>
            </div>

            {/* Telefono */}
            {booking.client_phone && (
              <div className="flex flex-row items-start gap-3 py-1.5 md:py-2">
                <span className="text-xs text-gray-500 w-24 md:w-28 font-medium uppercase tracking-wide flex-shrink-0">Telefono:</span>
                <span className="text-sm md:text-base font-semibold text-warm-wood-dark">{booking.client_phone}</span>
              </div>
            )}

            {/* Data */}
            <div className="flex flex-row items-start gap-3 py-1.5 md:py-2">
              <span className="text-xs text-gray-500 w-24 md:w-28 font-medium uppercase tracking-wide flex-shrink-0">Data:</span>
              <span className="text-sm md:text-base font-semibold text-warm-wood-dark">{formatDate(displayDate)}</span>
            </div>

            {/* Orario */}
            <div className="flex flex-row items-start gap-3 py-1.5 md:py-2">
              <span className="text-xs text-gray-500 w-24 md:w-28 font-medium uppercase tracking-wide flex-shrink-0">Orario:</span>
              <span className="text-sm md:text-base font-semibold text-warm-wood-dark">{formatTime(displayTime)}</span>
            </div>

            {/* Pax */}
            <div className="flex flex-row items-start gap-3 py-1.5 md:py-2">
              <span className="text-xs text-gray-500 w-24 md:w-28 font-medium uppercase tracking-wide flex-shrink-0">Pax:</span>
              <span className="text-sm md:text-base font-semibold text-warm-wood-dark">{booking.num_guests}</span>
            </div>

            {/* Tipo */}
            <div className="flex flex-row items-start gap-3 py-1.5 md:py-2">
              <span className="text-xs text-gray-500 w-24 md:w-28 font-medium uppercase tracking-wide flex-shrink-0">Tipo:</span>
              <span className="text-sm md:text-base font-semibold text-warm-wood-dark">{eventConfig.label}</span>
            </div>
          </div>

          {/* Note Richieste Speciali - Fuori dalla griglia */}
          {booking.special_requests && (
            <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t border-warm-orange/20">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2 md:mb-3">Richieste Speciali</p>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed break-words">
                {booking.special_requests}
              </p>
            </div>
          )}

          {/* Motivo rifiuto se presente */}
          {booking.rejection_reason && (
            <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t border-red-300/30">
              <p className="text-xs text-red-600 uppercase tracking-wide font-semibold mb-2 md:mb-3">Motivo Rifiuto</p>
              <p className="text-sm md:text-base text-red-700 leading-relaxed break-words">
                {booking.rejection_reason}
              </p>
            </div>
          )}

          {/* Pulsante Visualizza nel Calendario - Solo per prenotazioni accettate */}
          {booking.status === 'accepted' && booking.confirmed_start && onViewInCalendar && (() => {
            // Estrai data da confirmed_start senza conversioni timezone
            const dateMatch = booking.confirmed_start.match(/(\d{4})-(\d{2})-(\d{2})/)
            const dateStr = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : null

            if (!dateStr) return null

            return (
              <div className="flex gap-2 md:gap-4 pt-3 md:pt-4 border-t border-warm-orange/20 mt-4 md:mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewInCalendar(dateStr)
                  }}
                  style={{ backgroundColor: '#059669', color: 'white' }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 hover:bg-green-700 font-bold text-sm md:text-lg shadow-xl rounded-xl transition-all"
                >
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Visualizza nel Calendario</span>
                  <span className="sm:hidden">Calendario</span>
                </button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

interface ArchiveTabProps {
  onViewInCalendar?: (date: string) => void
}

export const ArchiveTab: React.FC<ArchiveTabProps> = ({ onViewInCalendar }) => {
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
      {/* Filters - Stile Allineato */}
      <div style={{
        background: 'linear-gradient(to bottom right, rgba(240, 244, 255, 0.9), rgba(224, 231, 255, 0.9), rgba(216, 220, 254, 0.9))',
        border: '3px solid rgba(129, 140, 248, 0.6)',
        boxShadow: '0 4px 12px -2px rgba(129, 140, 248, 0.2)',
      }} className="rounded-2xl p-6">
        <label className="text-base font-bold text-warm-wood uppercase tracking-wide mb-4 block">
          Filtra per Status
        </label>

        <div className="flex gap-4">
          {(['all', 'accepted', 'rejected'] as ArchiveFilter[]).map((f) => (
            <button
              key={f}
              data-filter={f}
              onClick={() => setFilter(f)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all font-bold uppercase tracking-wide
                ${filter === f
                  ? f === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500'
                    : f === 'accepted'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500'
                    : 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-rose-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }
              `}
            >
              {f === 'all' && <Archive className="w-5 h-5" />}
              {f === 'accepted' && <CheckCircle className="w-5 h-5" />}
              {f === 'rejected' && <XCircle className="w-5 h-5" />}
              {f === 'all' ? 'Tutte' : f === 'accepted' ? 'Accettate' : 'Rifiutate'}
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
              return <ArchiveBookingCard key={booking.id} booking={booking} onViewInCalendar={onViewInCalendar} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

