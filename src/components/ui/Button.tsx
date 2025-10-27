import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg hover:shadow-xl active:scale-[0.98] transform'

  const variantClasses = {
    primary: 'bg-gradient-to-r from-al-ritrovo-primary to-al-ritrovo-primary-dark hover:from-al-ritrovo-primary-dark hover:to-al-ritrovo-primary text-white focus:ring-al-ritrovo-primary/50',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 focus:ring-gray-400/50 border border-gray-300',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500/50',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-500/50',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-gray-300/50',
    outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700 focus:ring-gray-400/50'
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
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
