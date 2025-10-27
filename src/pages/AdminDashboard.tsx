import React from 'react'

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-al-ritrovo-primary text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Al Ritrovo - Dashboard Admin</h1>
        </div>
      </header>

      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Richieste Pendenti
            </h3>
            <p className="text-3xl font-bold text-status-pending">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Prenotazioni Accettate
            </h3>
            <p className="text-3xl font-bold text-status-accepted">0</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Totale Questo Mese
            </h3>
            <p className="text-3xl font-bold text-al-ritrovo-accent">0</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              Dashboard completa, calendario e gestione prenotazioni in arrivo nella Fase 5...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
