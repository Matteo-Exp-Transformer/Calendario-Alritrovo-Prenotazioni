import React, { useState } from 'react'
import { AdminHeader } from '@/components/AdminHeader'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { PendingRequestsTab } from '@/features/booking/components/PendingRequestsTab'
import { ArchiveTab } from '@/features/booking/components/ArchiveTab'
import { BookingCalendarTab } from '@/features/booking/components/BookingCalendarTab'
import { SettingsTab } from '@/features/booking/components/SettingsTab'
import { Calendar, Clock, Archive, Settings, CheckCircle, TrendingUp } from 'lucide-react'

type Tab = 'calendar' | 'pending' | 'archive' | 'settings'

interface NavItemProps {
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: number
  onClick: () => void
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all font-medium
      ${active
        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-indigo-900 shadow-lg scale-105'
        : 'text-white hover:bg-white/20 hover:text-yellow-200 hover:scale-105'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs md:text-sm">{label}</span>
    {badge && badge > 0 && (
      <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
        {badge}
      </span>
    )}
  </button>
)

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ElementType
  gradient: string
  subtitle: string
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient, subtitle, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      bg-gradient-to-br ${gradient}
      text-white rounded-2xl p-4 md:p-6
      shadow-xl
      border-2 border-white/20
      ${onClick ? 'cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl' : ''}
    `}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-1 font-display drop-shadow-lg truncate">{value}</h3>
        <p className="text-white/80 text-xs md:text-sm font-medium">{subtitle}</p>
      </div>
      <div className="bg-white/30 rounded-xl p-3 md:p-4 shadow-lg backdrop-blur-sm flex-shrink-0 ml-2">
        <Icon className="w-8 h-8 md:w-10 md:h-10" />
      </div>
    </div>
  </div>
)

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const [showPendingPanel, setShowPendingPanel] = useState(false)
  const { data: stats, isLoading: isLoadingStats } = useBookingStats()

  // Chiudi il pannello pendenti quando cambi tab
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab !== 'calendar') {
      setShowPendingPanel(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header con Navbar Orizzontale - Tema Colorato Professionale */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl border-b-4 border-yellow-400/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          {/* Top Bar: Logo + User Info */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-lg">Al Ritrovo</h1>
              <p className="text-yellow-200 text-xs md:text-sm mt-1 font-medium">Dashboard Amministratore</p>
            </div>
            <AdminHeader />
          </div>

          {/* Navigation Tabs Orizzontale */}
          <nav className="flex flex-wrap items-center gap-2 md:gap-3 pb-2">
            <NavItem
              icon={Calendar}
              label="Calendario"
              active={activeTab === 'calendar'}
              onClick={() => handleTabChange('calendar')}
            />
            <NavItem
              icon={Clock}
              label="Prenotazioni Pendenti"
              active={activeTab === 'pending'}
              badge={stats?.pending}
              onClick={() => handleTabChange('pending')}
            />
            <NavItem
              icon={Archive}
              label="Archivio"
              active={activeTab === 'archive'}
              onClick={() => handleTabChange('archive')}
            />
            <NavItem
              icon={Settings}
              label="Impostazioni"
              active={activeTab === 'settings'}
              onClick={() => handleTabChange('settings')}
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Statistiche Cards - Solo se non in modalità impostazioni */}
        {activeTab !== 'settings' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Totale Mese"
                value={isLoadingStats ? '...' : stats?.totalMonth || 0}
                subtitle="Prenotazioni questo mese"
                icon={TrendingUp}
                gradient="from-blue-500 to-indigo-600"
              />
              <StatCard
                title="Accettate"
                value={isLoadingStats ? '...' : stats?.accepted || 0}
                subtitle="Prenotazioni confermate"
                icon={CheckCircle}
                gradient="from-green-500 to-emerald-600"
              />
              <StatCard
                title="Pendenti"
                value={isLoadingStats ? '...' : stats?.pending || 0}
                subtitle="In attesa di conferma"
                icon={Clock}
                gradient="from-amber-500 to-orange-600"
                onClick={() => setShowPendingPanel(!showPendingPanel)}
              />
            </div>

            {/* Collapse Card con Prenotazioni Pendenti */}
            {showPendingPanel && activeTab === 'calendar' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-amber-500 overflow-hidden mb-8 animate-slideDown">
                {/* Header della Collapse Card */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 border-b-2 border-amber-600 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Prenotazioni Pendenti</h2>
                    <p className="text-sm text-white/90">{stats?.pending || 0} in attesa</p>
                  </div>
                  <button
                    onClick={() => setShowPendingPanel(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-all"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content - Prenotazioni */}
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  <PendingRequestsTab />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 min-h-[600px] border-2 border-purple-100 relative">
          {activeTab === 'calendar' && <BookingCalendarTab />}
          {activeTab === 'pending' && <PendingRequestsTab />}
          {activeTab === 'archive' && <ArchiveTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center text-sm text-warm-wood/60">
          <p>Al Ritrovo Booking System v2.0 - Dashboard Amministratore</p>
        </div>
      </footer>
    </div>
  )
}
