import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'
import { Input, Button, Label } from '@/components/ui'

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}
    let isValid = true

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email obbligatoria'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email non valida'
      isValid = false
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password obbligatoria'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password troppo corta (min. 6 caratteri)'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        toast.success('Login effettuato con successo!')
        navigate('/admin')
      } else {
        toast.error(result.error || 'Errore durante il login')
      }
    } catch (error) {
      toast.error('Errore imprevisto durante il login')
      console.error('Login error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-al-ritrovo-primary mb-2">
            Al Ritrovo
          </h1>
          <p className="text-gray-600">Area Admin - Accedi al Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors({ ...errors, email: undefined })
              }}
              placeholder="admin@alritrovo.com"
              required
              disabled={isSubmitting}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors({ ...errors, password: undefined })
              }}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Hai dimenticato la password?</p>
          <p className="mt-1 text-xs text-gray-400">
            Contatta il supporto tecnico per il reset
          </p>
        </div>
      </div>
    </div>
  )
}