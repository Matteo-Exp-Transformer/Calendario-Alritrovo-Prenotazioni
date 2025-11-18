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

export const DetailsTab: React.FC<Props> = ({
  booking: _booking,
  isEditMode,
  formData,
  onFormDataChange,
  onBookingTypeChange
}) => {
  return (
    <div className="space-y-6">
      {/* Section 1: Booking Type */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span>📋</span>
          <span>Tipo Prenotazione</span>
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
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span>👤</span>
          <span>Informazioni Cliente</span>
        </h3>
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          {/* Nome */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            {isEditMode ? (
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => onFormDataChange('client_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            ) : (
              <p className="text-gray-900">{formData.client_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditMode ? (
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => onFormDataChange('client_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            ) : (
              <p className="text-gray-900">{formData.client_email}</p>
            )}
          </div>

          {/* Telefono */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Telefono</label>
            {isEditMode ? (
              <input
                type="tel"
                value={formData.client_phone}
                onChange={(e) => onFormDataChange('client_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Opzionale"
              />
            ) : (
              <p className="text-gray-900">{formData.client_phone || 'Non fornito'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Event Details */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span>📅</span>
          <span>Dettagli Evento</span>
        </h3>
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          {/* Data */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Data</label>
            {isEditMode ? (
              <input
                type="date"
                value={formData.date}
                onChange={(e) => onFormDataChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            ) : (
              <p className="text-gray-900">
                {new Date(formData.date).toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Ora Inizio */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Ora Inizio</label>
            {isEditMode ? (
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => onFormDataChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            ) : (
              <p className="text-gray-900">{formData.startTime}</p>
            )}
          </div>

          {/* Ora Fine */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Ora Fine</label>
            {isEditMode ? (
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => onFormDataChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            ) : (
              <p className="text-gray-900">{formData.endTime}</p>
            )}
          </div>

          {/* Numero Ospiti */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Numero Ospiti</label>
            {isEditMode ? (
              <input
                type="number"
                min="1"
                value={formData.numGuests}
                onChange={(e) => onFormDataChange('numGuests', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            ) : (
              <p className="text-gray-900">
                {formData.numGuests} {formData.numGuests === 1 ? 'ospite' : 'ospiti'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Special Notes (tavolo only) */}
      {formData.booking_type === 'tavolo' && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span>📝</span>
            <span>Note Speciali</span>
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
        </div>
      )}
    </div>
  )
}
