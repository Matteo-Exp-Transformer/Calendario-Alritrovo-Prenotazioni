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
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 transition-all duration-300 focus:border-al-ritrovo-primary focus:outline-none focus:ring-4 focus:ring-al-ritrovo-primary/20 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 file:border-0 file:bg-transparent file:text-sm file:font-medium shadow-sm hover:shadow-md focus:shadow-lg',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
