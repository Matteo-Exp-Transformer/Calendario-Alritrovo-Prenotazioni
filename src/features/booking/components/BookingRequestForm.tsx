import React, { useState } from 'react'
import { Button, Input, Textarea, Label } from '@/components/ui'
import type { BookingRequestInput, EventType } from '@/types/booking'
import { useCreateBookingRequest } from '../hooks/useBookingRequests'
import { toast } from 'react-toastify'

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'cena', label: 'Cena' },
  { value: 'aperitivo', label: 'Aperitivo' },
  { value: 'evento', label: 'Evento Privato' },
  { value: 'laurea', label: 'Laurea' }
]

interface BookingRequestFormProps {
  onSubmit?: () => void
}

export const BookingRequestForm: React.FC<BookingRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<BookingRequestInput>({
    client_name: '',
    client_email: '',
    client_phone: '',
    event_type: 'cena',
    desired_date: '',
    desired_time: '',
    num_guests: 0,
    special_requests: ''
  })

  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset num_guests to 0 when cleared
  const handleNumGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      setFormData({ ...formData, num_guests: 0 })
      setErrors({ ...errors, num_guests: '' })
    } else {
      const value = parseInt(inputValue) || 0
      if (value >= 1 && value <= 110) {
        setFormData({ ...formData, num_guests: value })
        setErrors({ ...errors, num_guests: '' })
      }
    }
  }
  const { mutate, isPending } = useCreateBookingRequest()

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Name validation
    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Nome obbligatorio'
      isValid = false
    }

    // Email validation
    if (!formData.client_email.trim()) {
      newErrors.client_email = 'Email obbligatoria'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Email non valida'
      isValid = false
    }

    // Date validation
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

    // Num guests validation
    if (!formData.num_guests || formData.num_guests < 1) {
      newErrors.num_guests = 'Numero ospiti obbligatorio (min 1)'
      isValid = false
    } else if (formData.num_guests > 110) {
      newErrors.num_guests = 'Massimo 110 ospiti'
      isValid = false
    }

    // Privacy consent validation
    if (!privacyAccepted) {
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🔵 [BookingForm] Submit click')
    console.log('🔵 [BookingForm] Form data:', formData)
    console.log('🔵 [BookingForm] Privacy accepted:', privacyAccepted)

    if (!validate()) {
      if (!privacyAccepted) {
        toast.error('È necessario accettare la Privacy Policy per inviare la richiesta')
      }
      return
    }

    console.log('✅ [BookingForm] Validation passed, calling mutate...')
    mutate(formData, {
      onSuccess: () => {
        console.log('✅ [BookingForm] Mutation successful!')
        // Reset form
        setFormData({
          client_name: '',
          client_email: '',
          client_phone: '',
          event_type: 'cena',
          desired_date: '',
          desired_time: '',
          num_guests: 0,
          special_requests: ''
        })
        setPrivacyAccepted(false)
        onSubmit?.()
      },
      onError: (error) => {
        console.error('❌ [BookingForm] Mutation error:', error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="client_name">Nome Completo *</Label>
        <Input
          id="client_name"
          value={formData.client_name}
          onChange={(e) => {
            setFormData({ ...formData, client_name: e.target.value })
            setErrors({ ...errors, client_name: '' })
          }}
          placeholder="Mario Rossi"
          required
          className={errors.client_name ? 'border-red-500' : ''}
        />
        {errors.client_name && (
          <p className="text-sm text-red-500">{errors.client_name}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="client_email">Email *</Label>
        <Input
          id="client_email"
          type="email"
          value={formData.client_email}
          onChange={(e) => {
            setFormData({ ...formData, client_email: e.target.value })
            setErrors({ ...errors, client_email: '' })
          }}
          placeholder="nome@email.com"
          required
          className={errors.client_email ? 'border-red-500' : ''}
        />
        {errors.client_email && (
          <p className="text-sm text-red-500">{errors.client_email}</p>
        )}
      </div>

      {/* Telefono */}
      <div className="space-y-2">
        <Label htmlFor="client_phone">Telefono (Opzionale)</Label>
        <Input
          id="client_phone"
          type="tel"
          value={formData.client_phone}
          onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
          placeholder="351 123 4567"
        />
      </div>

      {/* Tipo Evento */}
      <div className="space-y-2">
        <Label htmlFor="event_type">Tipo Evento *</Label>
        <select
          id="event_type"
          value={formData.event_type}
          onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data */}
      <div className="space-y-2">
        <Label htmlFor="desired_date">Data Desiderata *</Label>
        <Input
          id="desired_date"
          type="date"
          value={formData.desired_date}
          onChange={(e) => {
            setFormData({ ...formData, desired_date: e.target.value })
            setErrors({ ...errors, desired_date: '' })
          }}
          required
          className={errors.desired_date ? 'border-red-500' : ''}
        />
        {errors.desired_date && (
          <p className="text-sm text-red-500">{errors.desired_date}</p>
        )}
      </div>

      {/* Ora */}
      <div className="space-y-2">
        <Label htmlFor="desired_time">Orario Desiderato</Label>
        <Input
          id="desired_time"
          type="time"
          value={formData.desired_time}
          onChange={(e) => setFormData({ ...formData, desired_time: e.target.value })}
        />
      </div>

      {/* Numero Ospiti */}
      <div className="space-y-2">
        <Label htmlFor="num_guests">Numero Ospiti *</Label>
        <Input
          id="num_guests"
          type="number"
          min="1"
          max="110"
          value={formData.num_guests || ''}
          onChange={handleNumGuestsChange}
          required
          placeholder="Inserisci numero ospiti"
          className={errors.num_guests ? 'border-red-500' : ''}
        />
        {errors.num_guests && (
          <p className="text-sm text-red-500">{errors.num_guests}</p>
        )}
      </div>

      {/* Note Speciali */}
      <div className="space-y-2">
        <Label htmlFor="special_requests">Note o Richieste Speciali</Label>
        <Textarea
          id="special_requests"
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          placeholder="Es: Menu vegetariano, intolleranze alimentari, tavolo specifico..."
          rows={4}
        />
      </div>

      {/* Privacy Policy */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy-consent"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
            className="mt-1"
          />
          <label htmlFor="privacy-consent" className="text-sm text-gray-700 cursor-pointer">
            Accetto la{' '}
            <a href="/privacy" target="_blank" className="underline text-blue-600 hover:text-blue-800">
              Privacy Policy
            </a>
            {' '}di Al Ritrovo *
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isPending}
        className="mt-6"
      >
        {isPending ? 'Invio in corso...' : 'Invia Richiesta Prenotazione'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        * I campi contrassegnati sono obbligatori.
      </p>
    </form>
  )
}

