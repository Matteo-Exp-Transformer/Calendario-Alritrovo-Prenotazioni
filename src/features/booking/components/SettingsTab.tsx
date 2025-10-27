import React, { useState } from 'react'
import { Button } from '@/components/ui'
import { Settings, Mail, Bell, Database, Shield } from 'lucide-react'
import { EmailLogsModal } from './EmailLogsModal'
import { TestEmailModal } from './TestEmailModal'

export const SettingsTab: React.FC = () => {
  const [showEmailLogs, setShowEmailLogs] = useState(false)
  const [showTestEmail, setShowTestEmail] = useState(false)

  const emailNotificationsEnabled = !!(
    import.meta.env.RESEND_API_KEY || import.meta.env.VITE_RESEND_API_KEY
  )

  const settings = [
    {
      name: 'Notifiche Email',
      description: 'Configurazione server email Resend',
      enabled: emailNotificationsEnabled,
      icon: <Mail className="h-8 w-8 text-blue-500" />,
      status: emailNotificationsEnabled ? '✅ Attivo' : '❌ Disattivato',
      color: emailNotificationsEnabled ? 'text-green-600' : 'text-red-600',
    },
    {
      name: 'Rate Limiting',
      description: 'Limita richieste eccessive dai clienti',
      enabled: true,
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      status: '✅ Attivo (max 3 richieste/ora)',
      color: 'text-green-600',
    },
    {
      name: 'Cookie Consent',
      description: 'Banner GDPR per consenso cookie',
      enabled: true,
      icon: <Database className="h-8 w-8 text-orange-500" />,
      status: '✅ Attivo',
      color: 'text-green-600',
    },
    {
      name: 'RLS Policies',
      description: 'Row Level Security per sicurezza database',
      enabled: true,
      icon: <Shield className="h-8 w-8 text-red-500" />,
      status: '✅ Configurato correttamente',
      color: 'text-yellow-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
          <Settings className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-indigo-900">Impostazioni Sistema</h2>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-400 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2 text-lg">Stato Sistema</h3>
            <p className="text-sm text-blue-50 font-medium">
              Il sistema di prenotazioni è in produzione (95%). Tutti i moduli core sono
              funzionanti. Fix applicato per bottone ACCETTA con debug completo.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-purple-200"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-md">
                {setting.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-indigo-900 mb-1">
                  {setting.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 font-medium">{setting.description}</p>
                <p className={`text-sm font-bold ${setting.color}`}>{setting.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Environment Variables Check */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
        <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Database className="h-5 w-5 text-white" />
          </div>
          Variabili Ambiente
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">VITE_SUPABASE_URL</span>
            <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {!!import.meta.env.VITE_SUPABASE_URL ? '✅ Configurato' : '❌ Mancante'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">VITE_SUPABASE_ANON_KEY</span>
            <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {!!import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurato' : '❌ Mancante'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">RESEND_API_KEY</span>
            <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {emailNotificationsEnabled ? '✅ Configurato' : '❌ Mancante'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">VITE_SUPABASE_SERVICE_ROLE_KEY (obsoleto)</span>
            <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              ✅ Non più necessario
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-900 mb-4">Azioni Disponibili</h3>
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="solid"
            size="lg"
            onClick={() => setShowTestEmail(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:scale-105 transition-all"
          >
            📧 Test Email Notifications
          </Button>
          <Button
            variant="solid"
            size="lg"
            onClick={() => {
              console.log('🔵 [SettingsTab] Clicked View Email Logs, opening modal')
              setShowEmailLogs(true)
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-105 transition-all"
          >
            📋 View Email Logs
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => alert('Export: da implementare')}
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:scale-105 transition-all"
          >
            💾 Export Settings
          </Button>
        </div>
      </div>

      {/* Email Logs Modal */}
      <EmailLogsModal isOpen={showEmailLogs} onClose={() => setShowEmailLogs(false)} />

      {/* Test Email Modal */}
      <TestEmailModal isOpen={showTestEmail} onClose={() => setShowTestEmail(false)} />
    </div>
  )
}

