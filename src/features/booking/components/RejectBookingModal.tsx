import React, { useState } from 'react'
import { Modal } from '@/components/ui'
import type { BookingRequest } from '@/types/booking'

interface RejectBookingModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingRequest | null
  onConfirm: (reason: string) => void
  isLoading?: boolean
}

export const RejectBookingModal: React.FC<RejectBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirm,
  isLoading = false,
}) => {
  const [rejectionReason, setRejectionReason] = useState('')

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setRejectionReason('')
      console.log('🔵 [RejectModal] Modal closed, resetting form')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 [RejectModal] handleSubmit called')
    console.log('🔵 [RejectModal] rejectionReason:', rejectionReason)
    console.log('🔵 [RejectModal] booking:', booking)
    console.log('🔵 [RejectModal] Calling onConfirm with reason:', rejectionReason)
    onConfirm(rejectionReason)
    console.log('✅ [RejectModal] onConfirm called successfully')
  }

  if (!booking || !isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rifiuta Prenotazione"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">
            <strong>⚠️ Attenzione:</strong> Stai per rifiutare la prenotazione di {booking.client_name}. 
            Questa azione può essere reversibile solo manualmente.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Motivo rifiuto (opzionale)
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Esempio: Sala già occupata, data non disponibile..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
            rows={4}
          />
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
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Conferma...' : '❌ Rifiuta Prenotazione'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

