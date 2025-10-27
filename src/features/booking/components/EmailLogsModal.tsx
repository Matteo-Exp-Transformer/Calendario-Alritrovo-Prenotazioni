import React from 'react'
import { Modal } from '@/components/ui'
import { useEmailLogs } from '../hooks/useEmailLogs'
import { Mail, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface EmailLogsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EmailLogsModal: React.FC<EmailLogsModalProps> = ({ isOpen, onClose }) => {
  console.log('🔵 [EmailLogsModal] Modal open:', isOpen)
  const { data: logs, isLoading, error } = useEmailLogs(100)
  
  console.log('🔵 [EmailLogsModal] Logs data:', logs)
  console.log('🔵 [EmailLogsModal] Loading:', isLoading)
  console.log('🔵 [EmailLogsModal] Error:', error)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <Mail className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'booking_accepted':
        return '📧 Conferma Prenotazione'
      case 'booking_rejected':
        return '📧 Rifiuto Prenotazione'
      case 'booking_cancelled':
        return '📧 Cancellazione Prenotazione'
      default:
        return type
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📧 Log Email Inviati">
      <div className="max-h-[70vh] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-al-ritrovo-primary" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Errore nel caricamento dei log: {error.message}</p>
          </div>
        )}

        {!isLoading && !error && logs && logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nessun log email trovato</p>
          </div>
        )}

        {!isLoading && !error && logs && logs.length > 0 && (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-al-ritrovo-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="font-semibold text-gray-900">
                      {getEmailTypeLabel(log.email_type)}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(log.status)}`}
                  >
                    {log.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Destinatario:</span>
                    <span>{log.recipient_email}</span>
                  </div>

                  {log.booking_id && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Booking ID:</span>
                      <span className="font-mono text-xs">{log.booking_id}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Data:</span>
                    <span>
                      {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: it })}
                    </span>
                  </div>

                  {log.error_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                      <span className="font-medium">Errore:</span> {log.error_message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

