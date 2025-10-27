import React, { useState } from 'react'
import { AdminHeader } from '@/components/AdminHeader'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { PendingRequestsTab } from '@/features/booking/components/PendingRequestsTab'
import { ArchiveTab } from '@/features/booking/components/ArchiveTab'
import { BookingCalendarTab } from '@/features/booking/components/BookingCalendarTab'
import { SettingsTab } from '@/features/booking/components/SettingsTab'

type Tab = 'calendar' | 'pending' | 'archive' | 'settings'

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const { data: stats, isLoading: isLoadingStats } = useBookingStats()

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />

      <div className="container mx-auto p-8">
        {/* Statistiche Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-xl rounded-xl p-8 hover:shadow-2xl transition-all border border-gray-200">
            <h3 className="text-base font-medium text-gray-500 mb-2 uppercase tracking-wider">
              Richieste Pendenti
            </h3>
            <p className="text-4xl font-extrabold text-status-pending">
              {isLoadingStats ? '...' : stats?.pending || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">In attesa di conferma</p>
          </div>

          <div className="bg-white rounded-lg shadow-xl rounded-xl p-8 hover:shadow-2xl transition-all border border-gray-200">
            <h3 className="text-base font-medium text-gray-500 mb-2 uppercase tracking-wider">
              Prenotazioni Accettate
            </h3>
            <p className="text-4xl font-extrabold text-status-accepted">
              {isLoadingStats ? '...' : stats?.accepted || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">Prenotazioni attive</p>
          </div>

          <div className="bg-white rounded-lg shadow-xl rounded-xl p-8 hover:shadow-2xl transition-all border border-gray-200">
            <h3 className="text-base font-medium text-gray-500 mb-2 uppercase tracking-wider">
              Totale Questo Mese
            </h3>
            <p className="text-4xl font-extrabold text-al-ritrovo-accent">
              {isLoadingStats ? '...' : stats?.total || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">Tutte le prenotazioni</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-xl mb-6 overflow-hidden border border-gray-200">
          <div className="border-b border-gray-100">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'calendar'
                    ? 'border-al-ritrovo-primary text-al-ritrovo-primary bg-al-ritrovo-primary/5'
                    : 'border-transparent text-gray-600 hover:text-al-ritrovo-primary hover:border-al-ritrovo-primary/50'
                }`}
              >
                📅 Calendario
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors relative ${
                  activeTab === 'pending'
                    ? 'border-al-ritrovo-primary text-al-ritrovo-primary bg-al-ritrovo-primary/5'
                    : 'border-transparent text-gray-600 hover:text-al-ritrovo-primary hover:border-al-ritrovo-primary/50'
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
                        className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                          activeTab === 'archive'
                            ? 'border-al-ritrovo-primary text-al-ritrovo-primary bg-al-ritrovo-primary/5'
                            : 'border-transparent text-gray-600 hover:text-al-ritrovo-primary hover:border-al-ritrovo-primary/50'
                        }`}
                      >
                        📚 Archivio
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${
                          activeTab === 'settings'
                            ? 'border-al-ritrovo-primary text-al-ritrovo-primary bg-al-ritrovo-primary/5'
                            : 'border-transparent text-gray-600 hover:text-al-ritrovo-primary hover:border-al-ritrovo-primary/50'
                        }`}
                      >
                        ⚙️ Impostazioni
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-8">
                    {activeTab === 'calendar' && <BookingCalendarTab />}
                    {activeTab === 'pending' && <PendingRequestsTab />}
                    {activeTab === 'archive' && <ArchiveTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                  </div>
        </div>
      </div>
    </div>
  )
}