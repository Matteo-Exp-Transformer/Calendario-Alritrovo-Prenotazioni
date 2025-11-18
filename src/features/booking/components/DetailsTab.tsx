import React from 'react'
import type { BookingRequest } from '@/types/booking'

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
const InfoRow: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <div className="flex gap-2">
    <span className="font-semibold text-gray-700">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
)

export const DetailsTab: React.FC<Props> = ({
  booking: _booking,
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
          <div className="inline-block">
            <span
              className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
                formData.booking_type === 'tavolo'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {formData.booking_type === 'tavolo' ? 'Prenota un Tavolo' : 'Rinfresco di Laurea'}
            </span>
          </div>
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
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => onFormDataChange('client_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                type="number"
                min="1"
                value={formData.numGuests}
                onChange={(e) => onFormDataChange('numGuests', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {/* View mode - grid layout without box */}
            <InfoRow label="Data" value={formatDate(formData.date)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoRow label="Ora Inizio" value={formData.startTime} />
              <InfoRow label="Ora Fine" value={formData.endTime} />
            </div>
            <InfoRow
              label="Numero Ospiti"
              value={`${formData.numGuests} ${formData.numGuests === 1 ? 'ospite' : 'ospiti'}`}
            />
          </div>
        )}
      </div>

      {/* Section 4: Special Notes (tavolo only) */}
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
