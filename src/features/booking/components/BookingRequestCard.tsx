import React, { useState } from 'react'
import type { BookingRequest } from '@/types/booking'
import { Button } from '@/components/ui'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, Users, Tag, MessageSquare, CheckCircle, XCircle, UtensilsCrossed, ChevronDown, ChevronUp, User, Mail, Phone } from 'lucide-react'

interface BookingRequestCardProps {
  booking: BookingRequest
  onAccept: (booking: BookingRequest) => void
  onReject: (booking: BookingRequest) => void
}

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  drink_caraffe: { label: 'Drink/Caraffe', icon: UtensilsCrossed, color: 'bg-blue-500' },
  drink_rinfresco_leggero: { label: 'Drink/Caraffe + rinfresco leggero', icon: UtensilsCrossed, color: 'bg-cyan-500' },
  drink_rinfresco_completo: { label: 'Drink/Caraffe + rinfresco completo', icon: UtensilsCrossed, color: 'bg-teal-500' },
  drink_rinfresco_completo_primo: { label: 'Drink/Caraffe + rinfresco completo + primo piatto', icon: UtensilsCrossed, color: 'bg-emerald-500' },
  menu_pranzo_cena: { label: 'Menu Pranzo / Menù Cena', icon: UtensilsCrossed, color: 'bg-amber-500' },
}

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  pending: { label: 'Pendente', bgColor: 'bg-status-pending/20', textColor: 'text-status-pending' },
  accepted: { label: 'Accettata', bgColor: 'bg-status-accepted/20', textColor: 'text-status-accepted' },
  rejected: { label: 'Rifiutata', bgColor: 'bg-status-rejected/20', textColor: 'text-status-rejected' },
}

// InfoItem component was removed as it's not used

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
    // Rimuovi i secondi se presenti (formato HH:MM:SS -> HH:MM)
    return timeStr.split(':').slice(0, 2).join(':')
  }

  const eventConfig = EVENT_TYPE_CONFIG[booking.event_type] || EVENT_TYPE_CONFIG.drink_caraffe
  const EventIcon = eventConfig.icon
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending

  return (
    <div className="
      bg-white rounded-2xl shadow-lg hover:shadow-xl
      border-2 border-white/80
      transition-all duration-300
      relative
      before:absolute before:inset-0 before:rounded-2xl before:border-2 before:border-white/40 before:content-['']
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

            {/* TUTTI I DATI in formato 2 colonne */}
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
                    <span className="text-base font-semibold text-warm-wood-dark">{formatDate(booking.desired_date)}</span>
                  </div>

                  {/* Ora */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-warm-orange flex-shrink-0" />
                    <span className="text-base font-semibold text-warm-wood-dark">{formatTime(booking.desired_time)}</span>
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

      {/* Contenuto Espandibile - DATI COMPLETI ORGANIZZATI IN 2 COLONNE */}
      {isExpanded && (
        <div className="p-6 bg-white border-t-2 border-warm-orange/10 animate-slideDown">
          {/* Dati Organizzati - Griglia a 2 colonne con più spazio */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Colonna 1 */}
            {/* Nome */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Nome:</span>
              <span className="text-base font-semibold text-warm-wood-dark">{booking.client_name}</span>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Email:</span>
              <span className="text-base font-semibold text-warm-wood-dark">{booking.client_email}</span>
            </div>

            {/* Telefono */}
            {booking.client_phone && (
              <div className="flex items-start gap-3 py-3">
                <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Telefono:</span>
                <span className="text-base font-semibold text-warm-wood-dark">{booking.client_phone}</span>
              </div>
            )}

            {/* Colonna 2 */}
            {/* Data */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Data:</span>
              <span className="text-base font-semibold text-warm-wood-dark">{formatDate(booking.desired_date)}</span>
            </div>

            {/* Orario */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Orario:</span>
              <span className="text-base font-semibold text-warm-wood-dark">{formatTime(booking.desired_time)}</span>
            </div>

            {/* Pax */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Pax:</span>
              <span className="text-base font-semibold text-warm-wood-dark">{booking.num_guests}</span>
            </div>

            {/* Tipo */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Tipo:</span>
              <span className="text-base font-semibold text-warm-wood-dark">{eventConfig.label}</span>
            </div>
          </div>

          {/* Note Richieste Speciali - Fuori dalla griglia */}
          {booking.special_requests && (
            <div className="pt-6 mt-6 border-t border-warm-orange/20">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Richieste Speciali</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {booking.special_requests}
              </p>
            </div>
          )}

          {/* Azioni con Bottoni Outline Grandi */}
          <div className="flex gap-4 pt-4 border-t border-warm-orange/20 mt-6">
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

