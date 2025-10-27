import React, { useState } from 'react'
import { Modal, Input, Label, Button } from '@/components/ui'
import { sendAndLogEmail } from '@/lib/email'
import { toast } from 'react-toastify'
import { Mail, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface TestEmailModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TestEmailModal: React.FC<TestEmailModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Inserisci un indirizzo email valido')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const result = await sendAndLogEmail(
        {
          to: email,
          subject: 'Test Email - Al Ritrovo Prenotazioni',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Al Ritrovo - Sistema Prenotazioni</h1>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                <h2 style="color: #333; margin-top: 0;">✅ Email di Test</h2>
                <p style="color: #666; line-height: 1.6;">
                  Questa è un'email di test per verificare che il sistema di notifiche funzioni correttamente.
                </p>
                <p style="color: #666; line-height: 1.6;">
                  Se hai ricevuto questa email, significa che il sistema di prenotazioni è configurato correttamente e può inviare notifiche ai clienti.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
                  <p style="margin: 0; color: #666;">
                    <strong>⏰ Data invio:</strong> ${new Date().toLocaleString('it-IT')}
                  </p>
                </div>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                  Al Ritrovo - Bologna, Italia
                </p>
              </div>
            </div>
          `,
        },
        'test_email'
      )

      if (result.success) {
        setResult({ success: true, message: 'Email inviata con successo!' })
        toast.success('Email di test inviata!')
      } else {
        setResult({ success: false, message: result.error || 'Errore sconosciuto' })
        toast.error('Errore nell\'invio dell\'email')
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Errore generico' })
      toast.error('Errore nell\'invio dell\'email')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setResult(null)
    setIsLoading(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="📧 Test Email Notifications">
      <div className="space-y-6">
        {!result && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Inviami un'email di test per verificare che il sistema di notifiche funzioni correttamente.
              </p>
            </div>

            <div>
              <Label htmlFor="test-email">Indirizzo Email</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="esempio@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleTestEmail}
                disabled={isLoading || !email}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                    Invio...
                  </>
                ) : (
                  <>
                    <Mail className="inline h-4 w-4 mr-2" />
                    Invia Test Email
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {result && (
          <div>
            {result.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Email Inviata!</h3>
                </div>
                <p className="text-green-800 mb-4">{result.message}</p>
                <p className="text-sm text-green-700">
                  Controlla la tua casella email. L'email potrebbe arrivare tra qualche minuto.
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Errore</h3>
                </div>
                <p className="text-red-800">{result.message}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                size="md"
                onClick={handleClose}
                className="flex-1"
              >
                Chiudi
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setResult(null)
                  setEmail('')
                }}
                className="flex-1"
              >
                Invia Altro Test
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

