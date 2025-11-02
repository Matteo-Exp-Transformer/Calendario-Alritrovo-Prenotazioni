import React, { useState } from 'react'
import { Input, Textarea } from '@/components/ui'
import type { BookingRequestInput, EventType } from '@/types/booking'
import { useCreateAdminBooking } from '../hooks/useAdminBookingRequests'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Send, Loader2 } from 'lucide-react'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'drink_caraffe', label: 'Drink/Caraffe' },
  { value: 'drink_rinfresco_leggero', label: 'Drink/Caraffe + rinfresco leggero' },
  { value: 'drink_rinfresco_completo', label: 'Drink/Caraffe + rinfresco completo' },
  { value: 'drink_rinfresco_completo_primo', label: 'Drink/Caraffe + rinfresco completo + primo piatto' },
  { value: 'menu_pranzo_cena', label: 'Menu Pranzo / Menù Cena' }
]

export const AdminBookingForm: React.FC = () => {
  const [formData, setFormData] = useState<BookingRequestInput>({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_type: 'drink_caraffe',
    booking_type: 'tavolo',
    desired_date: '',
    desired_time: '',
    num_guests: 0,
    special_requests: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const { mutate, isPending } = useCreateAdminBooking()
  const queryClient = useQueryClient()

  const handleNumGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    if (inputValue === '') {
      setFormData({ ...formData, num_guests: 0 })
      setErrors({ ...errors, num_guests: '' })
    } else if (/^\d+$/.test(inputValue)) {
      const value = parseInt(inputValue, 10)
      if (value >= 1 && value <= 110) {
        setFormData({ ...formData, num_guests: value })
        setErrors({ ...errors, num_guests: '' })
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Nome obbligatorio'
      isValid = false
    }

    // Email validation - optional but must be valid if provided
    if (formData.client_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Email non valida'
      isValid = false
    }

    // Phone validation - required
    if (!formData.client_phone || !formData.client_phone.trim()) {
      newErrors.client_phone = 'Numero di telefono obbligatorio'
      isValid = false
    }

    if (!formData.desired_date) {
      newErrors.desired_date = 'Data obbligatoria'
      isValid = false
    } else {
      const selectedDate = new Date(formData.desired_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.desired_date = 'La data non può essere nel passato'
        isValid = false
      }
    }

    // Time validation - required for admin bookings
    if (!formData.desired_time) {
      newErrors.desired_time = 'Orario obbligatorio'
      isValid = false
    }

    if (!formData.num_guests || formData.num_guests < 1) {
      newErrors.num_guests = 'Numero ospiti obbligatorio (min 1)'
      isValid = false
    } else if (formData.num_guests > 110) {
      newErrors.num_guests = 'Massimo 110 ospiti'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    mutate(formData, {
      onSuccess: () => {
        toast.success('Prenotazione creata con successo!')
        setFormData({
          client_name: '',
          client_email: '',
          client_phone: '',
          event_type: 'drink_caraffe',
          booking_type: 'tavolo',
          desired_date: '',
          desired_time: '',
          num_guests: 0,
          special_requests: ''
        })
        setErrors({})
        
        // Invalidate and refetch all booking-related queries
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        queryClient.invalidateQueries({ queryKey: ['booking-stats'] })
        queryClient.invalidateQueries({ queryKey: ['pending-bookings'] })
        queryClient.invalidateQueries({ queryKey: ['accepted-bookings'] })
        
        // Refresh the page after 1 second to ensure all data is updated
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      },
      onError: (error) => {
        console.error('Error creating booking:', error)
        toast.error('Errore nella creazione della prenotazione')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {/* Layout a 2 Colonne su schermi grandi */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* COLONNA SINISTRA: Dati Personali */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            Dati Personali
          </h3>

          {/* Nome */}
          <div className="space-y-2">
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => {
                setFormData({ ...formData, client_name: e.target.value })
                setErrors({ ...errors, client_name: '' })
              }}
              placeholder="Nome Completo *"
              required
              className={errors.client_name ? '!border-red-500' : ''}
            />
            {errors.client_name && (
              <p className="text-sm text-red-500">{errors.client_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => {
                setFormData({ ...formData, client_email: e.target.value })
                setErrors({ ...errors, client_email: '' })
              }}
              placeholder="Email (Opzionale)"
              className={errors.client_email ? '!border-red-500' : ''}
            />
            {errors.client_email && (
              <p className="text-sm text-red-500">{errors.client_email}</p>
            )}
          </div>

          {/* Telefono */}
          <div className="space-y-2">
            <Input
              id="client_phone"
              type="tel"
              value={formData.client_phone}
              onChange={(e) => {
                setFormData({ ...formData, client_phone: e.target.value })
                setErrors({ ...errors, client_phone: '' })
              }}
              required
              placeholder="Telefono *"
              className={errors.client_phone ? '!border-red-500' : ''}
            />
            {errors.client_phone && (
              <p className="text-sm text-red-500">{errors.client_phone}</p>
            )}
          </div>
        </div>

        {/* COLONNA DESTRA: Dettagli Prenotazione */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
            Dettagli Prenotazione
          </h3>

          {/* Tipo Evento */}
          <div className="space-y-2">
            <select
              id="event_type"
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
              required
              className="w-full"
              style={{
                borderRadius: '9999px',
                border: '1px solid rgba(0,0,0,0.2)',
                maxWidth: '600px',
                height: '56px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)',
                color: 'black',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                backgroundSize: '20px',
                paddingRight: '48px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8B6914'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <style>{`
              select#event_type option {
                color: black;
                background-color: white;
              }
              select#event_type::placeholder {
                color: black !important;
                opacity: 1 !important;
              }
            `}</style>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Input
              id="desired_date"
              type="date"
              value={formData.desired_date}
              onChange={(e) => {
                setFormData({ ...formData, desired_date: e.target.value })
                setErrors({ ...errors, desired_date: '' })
              }}
              required
              className={errors.desired_date ? '!border-red-500' : ''}
            />
            {errors.desired_date && (
              <p className="text-sm text-red-500">{errors.desired_date}</p>
            )}
          </div>

          {/* Ora */}
          <div className="space-y-2">
            <Input
              id="desired_time"
              type="time"
              value={formData.desired_time || ''}
              onChange={(e) => {
                setFormData({ ...formData, desired_time: e.target.value })
                setErrors({ ...errors, desired_time: '' })
              }}
              required
              className={errors.desired_time ? '!border-red-500' : ''}
            />
            {errors.desired_time && (
              <p className="text-sm text-red-500">{errors.desired_time}</p>
            )}
          </div>

          {/* Numero Ospiti */}
          <div className="space-y-2">
            <Input
              id="num_guests"
              type="text"
              inputMode="numeric"
              value={formData.num_guests || ''}
              onChange={handleNumGuestsChange}
              required
              placeholder="Numero Ospiti *"
              className={errors.num_guests ? '!border-red-500' : ''}
            />
            {errors.num_guests && (
              <p className="text-sm text-red-500">{errors.num_guests}</p>
            )}
          </div>
        </div>
      </div>

      {/* Note Speciali - Full Width */}
      <div className="space-y-2">
        <Textarea
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          placeholder="Note o Richieste Speciali"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:from-green-600 hover:to-emerald-700 hover:shadow-[0_10px_30px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          
          {/* Content */}
          <div className="relative flex items-center gap-3">
            {isPending ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Creazione in corso...</span>
              </>
            ) : (
              <>
                <Send className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="text-lg uppercase tracking-wide">Crea Prenotazione</span>
              </>
            )}
          </div>

          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 -inset-0.5">
            <div className="absolute inset-[-2px] rounded-2xl bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 blur opacity-75 animate-pulse"></div>
          </div>
        </button>
      </div>
    </form>
  )
}
