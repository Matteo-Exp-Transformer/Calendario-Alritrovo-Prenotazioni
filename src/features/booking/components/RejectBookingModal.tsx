import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
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
  useEffect(() => {
    if (isOpen) {
      console.log('✅ [RejectModal] Modal opened!')
    } else {
      setRejectionReason('')
      console.log('🔵 [RejectModal] Modal closed, resetting form')
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 [RejectModal] handleSubmit called')
    console.log('🔵 [RejectModal] rejectionReason:', rejectionReason)
    onConfirm(rejectionReason)
  }

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !booking) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99998,
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 99999,
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '32rem',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: 0,
            }}
          >
            Rifiuta Prenotazione
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              color: '#6b7280',
            }}
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Warning */}
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <p style={{ fontSize: '0.875rem', color: '#991b1b', margin: 0, fontWeight: 500 }}>
                <strong>⚠️ Attenzione:</strong> Stai per rifiutare la prenotazione di{' '}
                <strong>{booking.client_name}</strong>. Questa azione può essere reversibile solo manualmente.
              </p>
            </div>

            {/* Textarea */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="rejection-reason-textarea"
                style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}
              >
                Motivo rifiuto (opzionale)
              </label>
              <textarea
                id="rejection-reason-textarea"
                name="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Esempio: Sala già occupata, data non disponibile, sovrapposizione con altro evento..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #9ca3af',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  minHeight: '120px',
                  resize: 'vertical',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                }}
                rows={5}
                autoFocus
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', margin: 0 }}>
                Puoi lasciare questo campo vuoto se preferisci.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? 'Conferma...' : '❌ Rifiuta Prenotazione'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
