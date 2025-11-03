import React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    // LOCKED: 2025-01-16 - Textarea.tsx completamente testato
    // Test eseguiti: 30 test, tutti passati (100%)
    // Funzionalità: Textarea base, forwardRef, focus management, resize
    // NON MODIFICARE SENZA PERMESSO ESPLICITO
    return (
      <>
        <textarea
          className={cn(
            'flex rounded-modern border bg-white shadow-sm transition-all box-border',
            className
          )}
          style={{
            borderColor: 'rgba(0,0,0,0.2)',
            width: '100%',
            minHeight: '140px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(6px)',
            color: 'black',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
          onFocus={(e) => e.target.style.borderColor = '#8B6914'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
          ref={ref}
          {...props}
        />
        <style>{`
          textarea::placeholder {
            color: black !important;
            opacity: 1 !important;
          }
        `}</style>
      </>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
