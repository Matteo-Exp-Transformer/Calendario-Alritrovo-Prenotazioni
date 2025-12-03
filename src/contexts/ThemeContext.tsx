import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'balanced' | 'modern'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage or default to 'modern'
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('admin-theme')
    return (saved === 'modern' || saved === 'balanced') ? saved : 'modern'
  })

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'balanced') {
      root.setAttribute('data-theme', 'balanced')
    } else {
      root.removeAttribute('data-theme') // Default to modern
    }
    localStorage.setItem('admin-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'balanced' ? 'modern' : 'balanced')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
