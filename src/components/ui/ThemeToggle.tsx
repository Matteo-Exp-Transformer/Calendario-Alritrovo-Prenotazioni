import React from 'react'
import { Palette } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg px-3 py-2 transition-all duration-200 flex items-center gap-2 min-h-[44px]"
      style={{
        backgroundColor: 'var(--theme-surface-elevated)',
        border: '2px solid',
        borderColor: 'var(--theme-border-default)',
        color: 'var(--theme-text-secondary)',
      }}
      aria-label={`Switch to ${theme === 'balanced' ? 'modern' : 'balanced'} theme`}
      title={`Current theme: ${theme === 'balanced' ? 'Balanced' : 'Modern'}`}
    >
      <Palette className="w-4 h-4" />
      <span className="text-sm font-medium hidden md:inline">
        {theme === 'balanced' ? 'Balanced' : 'Modern'}
      </span>
    </button>
  )
}
