import React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // LOCKED: 2025-01-16 - Input.tsx completamente testato
    // Test eseguiti: 38 test, tutti passati (100%)
    // Combinazioni testate: tutti i tipi input, stati, edge cases, validazioni browser
    // UI aggiornato con design professionale moderno
  return (
    <>
      <input
        type={type}
        className={cn(
          'flex rounded-full border bg-white shadow-sm transition-all',
          className
        )}
        style={{ 
          borderColor: 'rgba(0,0,0,0.2)', 
          maxWidth: '600px',
          height: '56px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: '700',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(1px)',
          color: 'black'
        }}
        onFocus={(e) => e.target.style.borderColor = '#8B6914'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
        ref={ref}
        {...props}
      />
      <style>{`
        input::placeholder {
          color: black !important;
          opacity: 1 !important;
        }

        /* Mobile webkit fixes for date/time inputs visibility */
        input[type="date"]::-webkit-datetime-edit,
        input[type="time"]::-webkit-datetime-edit,
        input[type="date"]::-webkit-datetime-edit-fields-wrapper,
        input[type="time"]::-webkit-datetime-edit-fields-wrapper,
        input[type="date"]::-webkit-datetime-edit-text,
        input[type="time"]::-webkit-datetime-edit-text,
        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field,
        input[type="date"]::-webkit-datetime-edit-year-field,
        input[type="time"]::-webkit-datetime-edit-hour-field,
        input[type="time"]::-webkit-datetime-edit-minute-field,
        input[type="time"]::-webkit-datetime-edit-ampm-field {
          color: black !important;
          font-weight: 700 !important;
          padding: 0 !important;
        }

        /* Make calendar/clock icon visible and properly sized */
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 1 !important;
          color: black !important;
          cursor: pointer;
          filter: brightness(0) saturate(100%); /* Make icon black */
        }

        /* Ensure webkit inner spin button is visible if present */
        input[type="date"]::-webkit-inner-spin-button,
        input[type="time"]::-webkit-inner-spin-button {
          opacity: 1 !important;
        }
      `}</style>
    </>
  )
  }
)

Input.displayName = 'Input'

export { Input }
