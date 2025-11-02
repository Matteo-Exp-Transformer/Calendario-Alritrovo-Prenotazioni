import React, { useState } from 'react'
import type { BookingRequest } from '@/types/booking'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Clock, Users, Tag, MessageSquare, CheckCircle, XCircle, UtensilsCrossed, ChevronDown, User, Mail, Phone } from 'lucide-react'

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

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
  pending: { label: 'Pendente', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-400' },
  accepted: { label: 'Accettata', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-500' },
  rejected: { label: 'Rifiutata', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-500' },
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

  const eventConfig = booking.event_type ? (EVENT_TYPE_CONFIG[booking.event_type] || EVENT_TYPE_CONFIG.drink_caraffe) : EVENT_TYPE_CONFIG.drink_caraffe
  const EventIcon = eventConfig.icon
  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header Collapsible - MOSTRA TUTTI I DATI */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left rounded-t-lg hover:bg-gray-50 transition-all duration-200 active:scale-[0.995]"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {/* Colonna Sinistra */}
                <div className="space-y-3">
                  {/* Tipo Evento */}
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">{eventConfig.label}</span>
                  </div>

                  {/* Nome Cliente */}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{booking.client_name}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">{booking.client_email}</span>
                  </div>

                  {/* Telefono */}
                  {booking.client_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{booking.client_phone}</span>
                    </div>
                  )}
                </div>

                {/* Colonna Destra */}
                <div className="space-y-3">
                  {/* Data */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{formatDate(booking.desired_date)}</span>
                  </div>

                  {/* Ora */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{formatTime(booking.desired_time)}</span>
                  </div>

                  {/* Ospiti */}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{booking.num_guests} ospiti</span>
                  </div>

                  {/* Note preview se presenti */}
                  {booking.special_requests && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
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
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <span className={`
              px-3 py-1 rounded text-sm font-medium whitespace-nowrap border-l-4
              ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}
            `}>
              {statusConfig.label}
            </span>
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>
      </button>

      {/* Contenuto Espandibile - DATI COMPLETI ORGANIZZATI IN 2 COLONNE */}
      {isExpanded && (
        <div className="p-6 bg-gray-50 border-t border-gray-200 transition-all duration-300 ease-in-out">
          {/* Dati Organizzati - Griglia a 2 colonne con più spazio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {/* Colonna 1 */}
            {/* Nome */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Nome:</span>
              <span className="text-sm font-medium text-gray-900">{booking.client_name}</span>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Email:</span>
              <span className="text-sm font-medium text-gray-900">{booking.client_email}</span>
            </div>

            {/* Telefono */}
            {booking.client_phone && (
              <div className="flex items-start gap-3 py-3">
                <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Telefono:</span>
                <span className="text-sm font-medium text-gray-900">{booking.client_phone}</span>
              </div>
            )}

            {/* Colonna 2 */}
            {/* Data */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Data:</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(booking.desired_date)}</span>
            </div>

            {/* Orario */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Orario:</span>
              <span className="text-sm font-medium text-gray-900">{formatTime(booking.desired_time)}</span>
            </div>

            {/* Pax */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Pax:</span>
              <span className="text-sm font-medium text-gray-900">{booking.num_guests}</span>
            </div>

            {/* Tipo */}
            <div className="flex items-start gap-3 py-3">
              <span className="text-xs text-gray-500 w-20 font-medium uppercase tracking-wide">Tipo:</span>
              <span className="text-sm font-medium text-gray-900">
                {booking.booking_type === 'rinfresco_laurea' ? 'Rinfresco di Laurea' : booking.booking_type === 'tavolo' ? 'Prenota un Tavolo' : eventConfig.label}
              </span>
            </div>
          </div>

          {/* Menu Info - Solo per Rinfresco di Laurea */}
          {booking.booking_type === 'rinfresco_laurea' && booking.menu_selection && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Menu Selezionato</p>
              <div className="space-y-2">
                {booking.menu_total_per_person && (
                  <p className="text-sm font-bold text-warm-wood">
                    €{booking.menu_total_per_person.toFixed(2)}/persona
                    {booking.menu_total_booking && (
                      <span className="text-gray-600 ml-2">
                        (Totale: €{booking.menu_total_booking.toFixed(2)})
                      </span>
                    )}
                  </p>
                )}
                {Array.isArray(booking.menu_selection?.items) && booking.menu_selection.items.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Prodotti:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {booking.menu_selection.items.map((item: any, idx: number) => (
                        <li key={idx}>{item.name} - €{item.price.toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Intolleranze - Solo per Rinfresco di Laurea */}
          {booking.booking_type === 'rinfresco_laurea' && booking.dietary_restrictions && Array.isArray(booking.dietary_restrictions) && booking.dietary_restrictions.length > 0 && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Intolleranze Alimentari</p>
              <div className="space-y-2">
                {booking.dietary_restrictions.map((restriction: any, idx: number) => (
                  <p key={idx} className="text-sm text-gray-700">
                    <span className="font-semibold">{restriction.restriction}</span>
                    {restriction.restriction === 'Altro' && restriction.notes && ` (${restriction.notes})`}
                    {' - '}
                    {restriction.guest_count} {restriction.guest_count === 1 ? 'ospite' : 'ospiti'}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Note Richieste Speciali - Fuori dalla griglia */}
          {booking.special_requests && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Richieste Speciali</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {booking.special_requests}
              </p>
            </div>
          )}

          {/* Azioni con Bottoni Moderni */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onAccept(booking)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <CheckCircle className="w-5 h-5" />
              Accetta Prenotazione
            </button>
            <button
              type="button"
              onClick={() => onReject(booking)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <XCircle className="w-5 h-5" />
              Rifiuta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

