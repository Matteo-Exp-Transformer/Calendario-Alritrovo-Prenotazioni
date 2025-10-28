import React from 'react'
import { cn } from '@/lib/utils'

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    // LOCKED: 2025-01-16 - Label.tsx completamente testato
    // Test eseguiti: 21 test, tutti passati (100%)
    // Funzionalità: Label base, forwardRef, peer states, accessibilità
    // NON MODIFICARE SENZA PERMESSO ESPLICITO
    <label
      ref={ref}
      className={cn(
        'text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
)

Label.displayName = 'Label'

export { Label }
