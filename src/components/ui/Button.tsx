import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'outlineAccent' | 'outlineDanger' | 'solid' | 'solidAccent' | 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'outline',
  size = 'lg',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 hover:shadow-xl active:scale-[0.98] transform'

  const variantClasses = {
    // Nuovi stili OUTLINE (default)
    outline: 'border-2 border-warm-wood text-warm-wood bg-transparent hover:bg-warm-wood hover:text-white shadow-md hover:shadow-2xl focus:ring-warm-wood/30',
    outlineAccent: 'border-2 border-olive-green text-olive-green bg-transparent hover:bg-olive-green hover:text-white shadow-md hover:shadow-2xl focus:ring-olive-green/30',
    outlineDanger: 'border-2 border-terracotta text-terracotta bg-transparent hover:bg-terracotta hover:text-white shadow-md hover:shadow-2xl focus:ring-terracotta/30',

    // Stili SOLID (per azioni primarie)
    solid: 'bg-gradient-to-r from-warm-wood to-warm-wood-dark hover:from-warm-wood-dark hover:to-warm-wood text-white shadow-lg focus:ring-warm-wood/50',
    solidAccent: 'bg-gradient-to-r from-olive-green to-warm-wood hover:from-warm-wood hover:to-olive-green text-white shadow-lg focus:ring-olive-green/50',

    // Retrocompatibilità con vecchi stili
    primary: 'bg-gradient-to-r from-warm-wood to-warm-wood-dark hover:from-warm-wood-dark hover:to-warm-wood text-white shadow-lg focus:ring-warm-wood/50',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 focus:ring-gray-400/50 border border-gray-300 shadow-md',
    danger: 'bg-gradient-to-r from-terracotta to-red-700 hover:from-red-700 hover:to-terracotta text-white shadow-lg focus:ring-terracotta/50',
    success: 'bg-gradient-to-r from-olive-green to-green-700 hover:from-green-700 hover:to-olive-green text-white shadow-lg focus:ring-olive-green/50',
    ghost: 'bg-transparent hover:bg-warm-cream active:bg-warm-beige text-warm-wood focus:ring-warm-wood/30 shadow-none',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',        // Default PIÙ GRANDE
    xl: 'px-10 py-5 text-xl',       // Extra Large
    icon: 'p-2.5'
  }

  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed hover:shadow-lg active:scale-100' : ''
  const widthClasses = fullWidth ? 'w-full' : ''

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
