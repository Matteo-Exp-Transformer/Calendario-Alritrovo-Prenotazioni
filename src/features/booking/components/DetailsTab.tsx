import React from 'react'
import type { BookingRequest } from '@/types/booking'
import { formatBookingDateTime } from '../utils/formatDateTime'
import { MapPin } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

interface Props {
  booking: BookingRequest
  isEditMode: boolean
  formData: {
    booking_type: 'tavolo' | 'rinfresco_laurea'
    client_name: string
    client_email: string
    client_phone: string
    date: string
    startTime: string
    endTime: string
    numGuests: number
    specialRequests: string
    placement?: string | null
  }
  onFormDataChange: (field: string, value: any) => void
  onBookingTypeChange: (newType: 'tavolo' | 'rinfresco_laurea') => void
}

// Helper to capitalize first letter of date string
const capitalizeFirst = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Reusable component for label:value inline display
const InfoRow: React.FC<{
  label: string;
  value: string | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}> = ({ label, value, icon: Icon }) => (
  <div className="flex gap-2 min-w-0">
    {Icon && <Icon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />}
    <span className="font-semibold text-gray-700 flex-shrink-0">{label}:</span>
    <span className="text-gray-900 break-words overflow-wrap-anywhere min-w-0">{value}</span>
  </div>
)

export const DetailsTab: React.FC<Props> = ({
  booking,
  isEditMode,
  formData,
  onFormDataChange,
  onBookingTypeChange
}) => {
  // Format date with capitalized first letter
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const formatted = date.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      return capitalizeFirst(formatted)
    } catch {
      return dateString
    }
  }

  const creationDateLabel = formatBookingDateTime(booking.created_at)

  return (
    <div className="space-y-6">
      {/* Section 1: Booking Type */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Tipo Prenotazione
        </h3>
        {isEditMode ? (
          <select
            value={formData.booking_type}
            onChange={(e) => onBookingTypeChange(e.target.value as 'tavolo' | 'rinfresco_laurea')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="tavolo">Prenota un Tavolo</option>
            <option value="rinfresco_laurea">Rinfresco di Laurea</option>
          </select>
        ) : (
          <p className="text-gray-900 font-medium">
            {formData.booking_type === 'tavolo' ? 'Prenota un Tavolo' : 'Rinfresco di Laurea'}
          </p>
        )}
      </div>

      {/* Section 2: Client Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Informazioni Cliente
        </h3>
        {isEditMode ? (
          <div className="space-y-4">
            {/* Edit mode - vertical layout for usability */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => onFormDataChange('client_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-gray-500 font-normal text-xs">(opzionale)</span>
              </label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => onFormDataChange('client_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="opzionale"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Telefono</label>
              <input
                type="tel"
                value={formData.client_phone}
                onChange={(e) => onFormDataChange('client_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Opzionale"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
            {/* View mode - grid layout without box */}
            <InfoRow label="Nome" value={formData.client_name} />
            <InfoRow label="Email" value={formData.client_email} />
            <InfoRow label="Telefono" value={formData.client_phone || 'Non fornito'} />
          </div>
        )}
      </div>

      {/* Section 3: Event Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Dettagli Evento
        </h3>
        {isEditMode ? (
          <div className="space-y-4">
            {/* Edit mode - vertical layout */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => onFormDataChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Ora Inizio</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => onFormDataChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Ora Fine</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => onFormDataChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Numero Ospiti</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={formData.numGuests > 0 ? formData.numGuests.toString() : ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                  onFormDataChange('numGuests', value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4" />
                Posizionamento
              </label>
              <Select
                value={formData.placement || 'none'}
                onValueChange={(value) => onFormDataChange('placement', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona sala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuna preferenza</SelectItem>
                  <SelectItem value="Sala A">Sala A</SelectItem>
                  <SelectItem value="Sala B">Sala B</SelectItem>
                  <SelectItem value="Deorr">Deorr</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 min-w-0">
            {/* View mode - grid layout without box */}
            <InfoRow label="Data" value={formatDate(formData.date)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
              <InfoRow label="Ora Inizio" value={formData.startTime} />
              <InfoRow label="Ora Fine" value={formData.endTime} />
            </div>
            <InfoRow
              label="Numero Ospiti"
              value={`${formData.numGuests} ${formData.numGuests === 1 ? 'ospite' : 'ospiti'}`}
            />
            <InfoRow
              icon={MapPin}
              label="Posizionamento"
              value={booking.placement || 'Non specificato'}
            />
          </div>
        )}
      </div>

      {/* Section 4: Data Creazione */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Data Creazione
        </h3>
        <p className="text-gray-900 font-medium">{creationDateLabel}</p>
      </div>

      {/* Section 5: Special Notes (tavolo only) */}
      {formData.booking_type === 'tavolo' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Note Speciali
          </h3>
          {isEditMode ? (
            <textarea
              value={formData.specialRequests}
              onChange={(e) => onFormDataChange('specialRequests', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              placeholder="Inserisci eventuali richieste particolari..."
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">
              {formData.specialRequests || 'Nessuna nota aggiunta'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
