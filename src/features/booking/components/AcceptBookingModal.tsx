import React, { useState } from 'react'
import { Modal } from '@/components/ui'
import type { BookingRequest } from '@/types/booking'
import { format } from 'date-fns'

interface AcceptBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRequest | null
  onConfirm: (data: {
    confirmedStart: string
    confirmedEnd: string
    numGuests: number
  }) => void
  isLoading?: boolean
}

export const AcceptBookingModal: React.FC<AcceptBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirm,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    numGuests: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form when booking changes
  React.useEffect(() => {
    if (booking) {
      const date = booking.desired_date
      const startTime = booking.desired_time || '20:00'
      
      // Calculate end time (default +2 hours)
      const [hours, minutes] = startTime.split(':').map(Number)
      const endHours = (hours + 2) % 24
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

      setFormData({
        date: date,
        startTime,
        endTime,
        numGuests: booking.num_guests,
      })
      setErrors({})
    }
  }, [booking])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) {
      newErrors.date = 'Data richiesta'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Orario inizio richiesto'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Orario fine richiesto'
    }

    if (formData.numGuests < 1) {
      newErrors.numGuests = 'Numero ospiti minimo 1'
    }

    // Check if end time is before start time
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'Orario fine deve essere dopo orario inizio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate() || !booking) return

      // Ensure time format is HH:mm (not HH:mm:ss)
      const startTimeFormatted = formData.startTime.includes(':') 
        ? formData.startTime.split(':').slice(0, 2).join(':') 
        : formData.startTime
      const endTimeFormatted = formData.endTime.includes(':')
        ? formData.endTime.split(':').slice(0, 2).join(':')
        : formData.endTime
      
      const confirmedStart = `${formData.date}T${startTimeFormatted}:00`
      const confirmedEnd = `${formData.date}T${endTimeFormatted}:00`
      
      console.log('🔵 [AcceptModal] Submitting with:', { 
        confirmedStart, 
        confirmedEnd, 
        numGuests: formData.numGuests 
      })

    onConfirm({
      confirmedStart,
      confirmedEnd,
      numGuests: formData.numGuests,
    })
  }

  if (!booking) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accetta Prenotazione"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Cliente:</strong> {booking.client_name}<br />
            <strong>Evento:</strong> {booking.event_type}<br />
            <strong>Data richiesta:</strong> {format(new Date(booking.desired_date), 'dd/MM/yyyy')}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Data confermata *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => {
              setFormData({ ...formData, date: e.target.value })
              setErrors({ ...errors, date: '' })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-al-ritrovo-primary"
            required
          />
          {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Orario inizio *</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => {
                setFormData({ ...formData, startTime: e.target.value })
                setErrors({ ...errors, startTime: '' })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-al-ritrovo-primary"
              required
            />
            {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Orario fine *</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => {
                setFormData({ ...formData, endTime: e.target.value })
                setErrors({ ...errors, endTime: '' })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-al-ritrovo-primary"
              required
            />
            {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Numero ospiti *</label>
          <input
            type="number"
            min="1"
            max="110"
            value={formData.numGuests || ''}
            onChange={(e) => {
              setFormData({ ...formData, numGuests: Number(e.target.value) })
              setErrors({ ...errors, numGuests: '' })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-al-ritrovo-primary"
            required
          />
          {errors.numGuests && <p className="text-sm text-red-500">{errors.numGuests}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-al-ritrovo-primary text-white rounded-md hover:bg-al-ritrovo-primary-dark transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Conferma...' : '✅ Conferma Prenotazione'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

