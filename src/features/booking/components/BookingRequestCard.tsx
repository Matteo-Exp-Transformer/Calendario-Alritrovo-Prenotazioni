import React, { useState } from 'react'
import type { BookingRequest } from '@/types/booking'
import { Button } from '@/components/ui'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, Users, Tag, MessageSquare, CheckCircle, XCircle, UtensilsCrossed, Wine, PartyPopper, GraduationCap, ChevronDown, ChevronUp, User, Mail, Phone } from 'lucide-react'

interface BookingRequestCardProps {
  booking: BookingRequest
  onAccept: (booking: BookingRequest) => void
  onReject: (booking: BookingRequest) => void
}

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  cena: { label: 'Cena', icon: UtensilsCrossed, color: 'bg-booking-cena' },
  aperitivo: { label: 'Aperitivo', icon: Wine, color: 'bg-booking-aperitivo' },
  evento: { label: 'Evento Privato', icon: PartyPopper, color: 'bg-booking-evento' },
  laurea: { label: 'Laurea', icon: GraduationCap, color: 'bg-booking-laurea' },
}

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  pending: { label: 'Pendente', bgColor: 'bg-status-pending/20', textColor: 'text-status-pending' },
  accepted: { label: 'Accettata', bgColor: 'bg-status-accepted/20', textColor: 'text-status-accepted' },
  rejected: { label: 'Rifiutata', bgColor: 'bg-status-rejected/20', textColor: 'text-status-rejected' },
}

interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string | number
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-warm-cream flex items-center justify-center">
      <Icon className="w-5 h-5 text-warm-orange" />
    </div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-base font-semibold text-warm-wood-dark">{value}</p>
    </div>
  </div>
)

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  booking,
  onAccept,
  onReject,
}) => {
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
    return timeStr
  }

  const eventConfig = EVENT_TYPE_CONFIG[booking.event_type] || EVENT_TYPE_CONFIG.cena
  const EventIcon = eventConfig.icon
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending

  return (
    <div className="
      bg-white rounded-2xl shadow-lg hover:shadow-xl
      border-2 border-warm-orange/30
      overflow-hidden
      transition-all duration-300
    ">
      {/* Header Collapsible - MOSTRA TUTTI I DATI */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 bg-gradient-to-r from-warm-cream/50 to-warm-beige/30 hover:from-warm-cream hover:to-warm-beige transition-all"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icona Tipo Evento */}
            <div className={`
              w-16 h-16 rounded-xl flex items-center justify-center
              ${eventConfig.color} shadow-md flex-shrink-0
            `}>
              <EventIcon className="w-8 h-8 text-white" />
            </div>

            {/* TUTTI I DATI in formato compatto */}
            <div className="text-left flex-1 space-y-3">
              {/* Riga 1: Tipo Evento e Cliente */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-warm-orange" />
                  <span className="text-lg font-bold text-warm-wood">{eventConfig.label}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-warm-wood" />
                  <span className="font-semibold text-warm-wood-dark">{booking.client_name}</span>
                </div>
              </div>

              {/* Riga 2: Data, Ora, Ospiti */}
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4 text-warm-orange" />
                  <span className="font-medium text-warm-wood-dark">{formatDate(booking.desired_date)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-warm-orange" />
                  <span className="font-medium text-warm-wood-dark">{formatTime(booking.desired_time)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg">
                  <Users className="w-4 h-4 text-warm-orange" />
                  <span className="font-medium text-warm-wood-dark">{booking.num_guests} ospiti</span>
                </div>
              </div>

              {/* Riga 3: Email e Telefono */}
              <div className="flex items-center gap-4 flex-wrap text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-warm-orange" />
                  <span>{booking.client_email}</span>
                </div>
                {booking.client_phone && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-warm-orange" />
                      <span>{booking.client_phone}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Riga 4: Note preview se presenti */}
              {booking.special_requests && (
                <div className="flex items-start gap-1.5 text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-warm-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 line-clamp-1 italic">
                    {booking.special_requests}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Badge Status + Icona Expand */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              ${statusConfig.bgColor} ${statusConfig.textColor}
            `}>
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

      {/* Contenuto Espandibile - DATI CLIENTE */}
      {isExpanded && (
        <div className="p-6 space-y-6 bg-white border-t-2 border-warm-orange/10 animate-slideDown">
          {/* Sezione Dati Cliente */}
          <div className="bg-gradient-to-br from-warm-cream/40 to-warm-beige/20 rounded-xl p-6 border-2 border-warm-orange/20">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-warm-wood" />
              <h4 className="text-lg font-bold text-warm-wood">Dati Cliente</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-warm-orange" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Nome Completo</p>
                  <p className="text-base font-semibold text-warm-wood-dark">{booking.client_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-warm-orange" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-base font-semibold text-warm-wood-dark">{booking.client_email}</p>
                </div>
              </div>

              {booking.client_phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-warm-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Telefono</p>
                    <p className="text-base font-semibold text-warm-wood-dark">{booking.client_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note se presenti */}
          {booking.special_requests && (
            <div className="bg-warm-orange/10 rounded-xl p-4 border-2 border-warm-orange/30">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-5 h-5 text-warm-orange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Richieste Speciali</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {booking.special_requests}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Azioni con Bottoni Outline Grandi */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outlineAccent"
              size="xl"
              onClick={() => onAccept(booking)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Accetta Prenotazione
            </Button>
            <Button
              variant="outlineDanger"
              size="xl"
              onClick={() => onReject(booking)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Rifiuta
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

