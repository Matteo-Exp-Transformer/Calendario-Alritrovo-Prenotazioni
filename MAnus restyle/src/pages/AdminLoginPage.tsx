import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'
import { Input, Button, Label } from '@/components/ui'
import { Lock, Shield, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-md w-full border border-gray-200 rounded-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-al-ritrovo-primary rounded-xl mb-6 shadow-xl shadow-al-ritrovo-primary/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            Al Ritrovo
          </h1>
          <p className="text-gray-500">Area Admin - Accedi al Dashboard</p>
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
            className="group"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Accesso in corso...
              </>
            ) : (
              <>
                Accedi
                <ArrowRight className="ml-2 w-4 h-4 inline group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <p className="text-xs text-gray-500 font-medium">
              Area riservata - Accesso protetto
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-gray-500 font-medium">
            Hai dimenticato la password? Contatta il supporto tecnico
          </p>
        </div>
      </div>
    </div>
  )
}