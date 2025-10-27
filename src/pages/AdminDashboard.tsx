import React, { useState } from 'react'
import { AdminHeader } from '@/components/AdminHeader'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { PendingRequestsTab } from '@/features/booking/components/PendingRequestsTab'
import { ArchiveTab } from '@/features/booking/components/ArchiveTab'
import { BookingCalendarTab } from '@/features/booking/components/BookingCalendarTab'

type Tab = 'calendar' | 'pending' | 'archive'

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const { data: stats, isLoading: isLoadingStats } = useBookingStats()

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
            <p className="text-3xl font-bold text-status-pending">
              {isLoadingStats ? '...' : stats?.pending || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">In attesa di conferma</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Prenotazioni Accettate
            </h3>
            <p className="text-3xl font-bold text-status-accepted">
              {isLoadingStats ? '...' : stats?.accepted || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">Prenotazioni attive</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Totale Questo Mese
            </h3>
            <p className="text-3xl font-bold text-al-ritrovo-accent">
              {isLoadingStats ? '...' : stats?.total || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">Tutte le prenotazioni</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'calendar'
                    ? 'border-al-ritrovo-primary text-al-ritrovo-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📅 Calendario
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === 'pending'
                    ? 'border-al-ritrovo-primary text-al-ritrovo-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⏳ Prenotazioni Pendenti
                {!isLoadingStats && stats && stats.pending > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-pending text-yellow-900">
                    {stats.pending}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('archive')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'archive'
                    ? 'border-al-ritrovo-primary text-al-ritrovo-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 Archivio
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'calendar' && <BookingCalendarTab />}
            {activeTab === 'pending' && <PendingRequestsTab />}
            {activeTab === 'archive' && <ArchiveTab />}
          </div>
        </div>
      </div>
    </div>
  )
}