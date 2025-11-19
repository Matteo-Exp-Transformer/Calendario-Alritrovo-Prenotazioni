import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CapacityWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  exceededBy: number
  slotName: string
  totalOccupied: number
  capacity: number
}

export const CapacityWarningModal: React.FC<CapacityWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  exceededBy,
  slotName,
  totalOccupied,
  capacity,
}) => {
  useEffect(() => {
    if (isOpen) {
      console.log('✅ [CapacityWarningModal] Modal opened, setting body overflow hidden')
      document.body.style.overflow = 'hidden'
      
      // Debug: Check if modal is in DOM after a short delay
      setTimeout(() => {
        const modalElement = document.querySelector('[aria-labelledby="capacity-warning-title"]')
        const containerElement = document.querySelector('[role="dialog"][aria-modal="true"]')
        
        console.log('🔍 [CapacityWarningModal] Checking DOM elements:', {
          modalElement: !!modalElement,
          containerElement: !!containerElement,
          allDialogs: document.querySelectorAll('[role="dialog"]').length
        })
        
        if (containerElement) {
          const containerStyles = window.getComputedStyle(containerElement)
          const containerRect = containerElement.getBoundingClientRect()
          console.log('🔍 [CapacityWarningModal] Container found:', {
            element: containerElement,
            display: containerStyles.display,
            visibility: containerStyles.visibility,
            opacity: containerStyles.opacity,
            zIndex: containerStyles.zIndex,
            position: containerStyles.position,
            rect: {
              top: containerRect.top,
              left: containerRect.left,
              width: containerRect.width,
              height: containerRect.height
            },
            isInViewport: containerRect.top >= 0 && containerRect.left >= 0 && 
                         containerRect.bottom <= window.innerHeight && 
                         containerRect.right <= window.innerWidth
          })
          
          // Check for elements that might be covering the modal
          const elementsAtPoint = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
          console.log('🔍 [CapacityWarningModal] Elements at center of screen:', elementsAtPoint.map(el => ({
            tag: el.tagName,
            className: el.className,
            zIndex: window.getComputedStyle(el).zIndex,
            position: window.getComputedStyle(el).position
          })))
        }
        
        if (modalElement) {
          const styles = window.getComputedStyle(modalElement)
          const rect = modalElement.getBoundingClientRect()
          console.log('🔍 [CapacityWarningModal] Modal found in DOM:', {
            element: modalElement,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            zIndex: styles.zIndex,
            position: styles.position,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            },
            isVisible: rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0'
          })
        } else {
          console.error('❌ [CapacityWarningModal] Modal NOT found in DOM!')
        }
      }, 100)
    } else {
      console.log('🔵 [CapacityWarningModal] Modal closed, resetting body overflow')
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('🔵 [CapacityWarningModal] Escape pressed, closing modal')
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    console.log('🔵 [CapacityWarningModal] Not rendering - isOpen is false')
    return null
  }

  console.log('✅ [CapacityWarningModal] Rendering modal directly with portal!', {
    isOpen,
    exceededBy,
    slotName,
    totalOccupied,
    capacity
  })

  // Verify document.body exists
  if (!document.body) {
    console.error('❌ [CapacityWarningModal] document.body is null!')
    return null
  }

  console.log('✅ [CapacityWarningModal] document.body exists, creating portal')

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('🔵 [CapacityWarningModal] Overlay clicked, closing modal')
      onClose()
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capacity-warning-title"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        pointerEvents: 'auto'
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 0
        }}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg z-10"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '32rem',
          zIndex: 10,
          display: 'block',
          visibility: 'visible',
          opacity: 1
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2
            id="capacity-warning-title"
            className="text-lg font-semibold text-gray-900"
          >
            ⚠️ Attenzione: Capacità Superata
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Box */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-red-800 mb-2">
                  La prenotazione supera la capienza massima disponibile
                </p>
                <div className="space-y-1 text-sm text-red-700">
                  <p>
                    <strong className="font-semibold">Fascia oraria:</strong> {slotName}
                  </p>
                  <p>
                    <strong className="font-semibold">Capienza massima:</strong> {capacity} coperti
                  </p>
                  <p>
                    <strong className="font-semibold">Coperti totali (con questa prenotazione):</strong> {totalOccupied} coperti
                  </p>
                  <p className="font-bold text-red-800 mt-2">
                    ⚠️ Eccedenza: {exceededBy} coperti oltre il limite
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-sm">
            <p className="text-sm text-yellow-800">
              <strong className="font-semibold">Nota:</strong> Se procedi, la fascia oraria verrà visualizzata in rosso nel calendario per indicare che la capienza è stata superata.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                console.log('🔵 [CapacityWarningModal] Cancel clicked')
                onCancel()
                onClose()
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('✅ [CapacityWarningModal] Confirm clicked')
                onConfirm()
                onClose()
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Procedi Comunque
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  try {
    console.log('✅ [CapacityWarningModal] Creating portal to document.body')
    const portal = createPortal(modalContent, document.body)
    console.log('✅ [CapacityWarningModal] Portal created successfully:', portal)
    return portal
  } catch (error) {
    console.error('❌ [CapacityWarningModal] Error creating portal:', error)
    // Fallback: render directly without portal
    console.log('⚠️ [CapacityWarningModal] Falling back to direct render')
    return modalContent
  }
}

