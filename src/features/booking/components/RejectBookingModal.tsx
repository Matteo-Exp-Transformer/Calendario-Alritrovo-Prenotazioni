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
      console.log('✅ [RejectModal] Modal opened!', {
        isOpen,
        hasBooking: !!booking,
        bookingId: booking?.id
      })
      document.body.style.overflow = 'hidden'
    } else {
      setRejectionReason('')
      console.log('🔵 [RejectModal] Modal closed, resetting form')
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, booking])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 [RejectModal] handleSubmit called')
    console.log('🔵 [RejectModal] rejectionReason:', rejectionReason)
    onConfirm(rejectionReason)
  }

  if (!isOpen || !booking) {
    return null
  }

  console.log('✅ [RejectModal] Rendering modal', { isOpen, bookingId: booking.id })

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      {/* Overlay - Completamente opaco */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal - Centrato */}
      <div 
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '32rem',
          maxHeight: '90vh',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          zIndex: 10000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fef2f2'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#111827'
          }}>
            ❌ Rifiuta Prenotazione
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.color = '#374151'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#6b7280'
            }}
            aria-label="Chiudi"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#ffffff',
          maxHeight: 'calc(90vh - 180px)',
          overflowY: 'auto'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Warning */}
            <div style={{
              backgroundColor: '#fef3c7',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '0 0.5rem 0.5rem 0',
              padding: '1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fill="#f59e0b"/>
                </svg>
              </div>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#92400e',
                lineHeight: '1.5'
              }}>
                <strong>Attenzione:</strong> Stai per rifiutare la prenotazione di{' '}
                <strong style={{ color: '#78350f' }}>{booking.client_name}</strong>. 
                Questa azione può essere reversibile solo manualmente.
              </p>
            </div>

            {/* Textarea */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                htmlFor="rejection-reason-textarea"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151'
                }}
              >
                Motivo rifiuto <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opzionale)</span>
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
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  minHeight: '120px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                rows={5}
                autoFocus
              />
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                Puoi lasciare questo campo vuoto se preferisci.
              </p>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#e5e7eb'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                  }
                }}
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#b91c1c'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#dc2626'
                  }
                }}
              >
                {isLoading ? 'Rifiutando...' : '❌ Rifiuta Prenotazione'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
