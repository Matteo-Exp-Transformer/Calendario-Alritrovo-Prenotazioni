import React, { useEffect, useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  position?: 'center' | 'right'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  position = 'center',
}) => {
  // LOCKED: 2025-01-16 - Modal.tsx completamente testato
  // Test eseguiti: 39 test, tutti passati (100%)
  // Combinazioni testate: tutte le dimensioni, stati, focus management, accessibility, edge cases
  // NON MODIFICARE SENZA PERMESSO ESPLICITO
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus the modal
      modalRef.current?.focus()

      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      // Add escape key listener
      const handleEscape = (e: KeyboardEvent) => {
        if (closeOnEscape && e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'

        // Restore focus to the previously focused element
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${position === 'right' ? 'overflow-hidden' : 'overflow-y-auto'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`flex min-h-full ${position === 'right' ? 'items-start justify-end' : 'items-center justify-center'} ${position === 'right' ? '' : 'p-4'}`}>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
          onClick={handleOverlayClick}
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={`relative bg-white ${position === 'right' ? 'shadow-2xl w-full max-w-2xl h-full flex flex-col' : 'rounded-lg shadow-xl w-full'} ${sizeClasses[size]} focus:outline-none`}
          tabIndex={-1}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${position === 'right' ? 'flex-shrink-0' : ''}`}>
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div className={`p-6 ${position === 'right' ? 'overflow-y-auto flex-1' : ''}`}>{children}</div>
        </div>
      </div>
    </div>
  )
}

interface ModalActionsProps {
  children: ReactNode
  className?: string
}

export const ModalActions: React.FC<ModalActionsProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 ${className}`}
    >
      {children}
    </div>
  )
}

export default Modal
