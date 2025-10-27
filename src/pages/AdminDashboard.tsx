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
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, gradient, subtitle }) => (
  <div className={`
    bg-gradient-to-br ${gradient}
    text-white rounded-2xl p-6
    shadow-xl
    border-2 border-white/20
  `}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/90 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-5xl font-bold mt-2 mb-1 font-display drop-shadow-lg">{value}</h3>
        <p className="text-white/80 text-sm font-medium">{subtitle}</p>
      </div>
      <div className="bg-white/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
        <Icon className="w-10 h-10" />
      </div>
    </div>
  </div>
)

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const { data: stats, isLoading: isLoadingStats } = useBookingStats()

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
              onClick={() => setActiveTab('calendar')}
            />
            <NavItem
              icon={Clock}
              label="Prenotazioni Pendenti"
              active={activeTab === 'pending'}
              badge={stats?.pending}
              onClick={() => setActiveTab('pending')}
            />
            <NavItem
              icon={Archive}
              label="Archivio"
              active={activeTab === 'archive'}
              onClick={() => setActiveTab('archive')}
            />
            <NavItem
              icon={Settings}
              label="Impostazioni"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Statistiche Cards - Solo se non in modalità impostazioni */}
        {activeTab !== 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Pendenti"
              value={isLoadingStats ? '...' : stats?.pending || 0}
              subtitle="In attesa di conferma"
              icon={Clock}
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard
              title="Accettate"
              value={isLoadingStats ? '...' : stats?.accepted || 0}
              subtitle="Prenotazioni confermate"
              icon={CheckCircle}
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Totale Mese"
              value={isLoadingStats ? '...' : stats?.totalMonth || 0}
              subtitle="Prenotazioni questo mese"
              icon={TrendingUp}
              gradient="from-blue-500 to-indigo-600"
            />
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 min-h-[600px] border-2 border-purple-100">
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
