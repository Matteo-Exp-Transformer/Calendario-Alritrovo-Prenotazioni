import React from 'react'
import { AdminHeader } from '@/components/AdminHeader'

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="container mx-auto p-8">
        {/* Statistiche Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Richieste Pendenti
            </h3>
            <p className="text-3xl font-bold text-status-pending">0</p>
            <p className="text-sm text-gray-500 mt-2">In attesa di conferma</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Prenotazioni Accettate
            </h3>
            <p className="text-3xl font-bold text-status-accepted">0</p>
            <p className="text-sm text-gray-500 mt-2">Prenotazioni attive</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Totale Questo Mese
            </h3>
            <p className="text-3xl font-bold text-al-ritrovo-accent">0</p>
            <p className="text-sm text-gray-500 mt-2">Tutte le prenotazioni</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              🎉 <strong>Fase 3 completata!</strong> Sistema di autenticazione funzionante. 
              Proseguiamo con il calendario nella Fase 5-6.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}