import React, { useState } from 'react'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { PendingRequestsTab } from '@/features/booking/components/PendingRequestsTab'
import { ArchiveTab } from '@/features/booking/components/ArchiveTab'
import { BookingCalendarTab } from '@/features/booking/components/BookingCalendarTab'
import { AdminBookingForm } from '@/features/booking/components/AdminBookingForm'
import { Calendar, Clock, Archive, Plus, User, Shield } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { useAdminAuth } from '@/features/booking/hooks/useAdminAuth'

type Tab = 'calendar' | 'pending' | 'archive'

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
    className="relative flex items-center gap-3 px-4 md:px-6 py-3 rounded-lg transition-all duration-200 border-2 cursor-pointer min-h-[44px] active:scale-[0.98]"
    style={active ? {
      backgroundColor: 'var(--theme-surface-nav-active)',
      borderColor: 'var(--theme-border-nav-active)',
      color: 'var(--theme-text-nav-active)',
      fontWeight: 600,
      boxShadow: 'var(--theme-shadow-sm)'
    } : {
      backgroundColor: 'var(--theme-surface-nav-inactive)',
      borderColor: 'var(--theme-border-nav-inactive)',
      color: 'var(--theme-text-nav-inactive)',
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'var(--theme-surface-hover)'
        e.currentTarget.style.borderColor = 'var(--theme-border-strong)'
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = 'var(--theme-surface-nav-inactive)'
        e.currentTarget.style.borderColor = 'var(--theme-border-nav-inactive)'
      }
    }}
  >
    <div
      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
      style={{
        backgroundColor: active ? 'var(--theme-accent-primary)' : 'var(--theme-surface-hover)',
        opacity: active ? 0.1 : 1
      }}
    >
      <Icon
        className="w-5 h-5"
        style={{ color: active ? 'var(--theme-text-nav-active)' : 'var(--theme-text-secondary)' }}
      />
    </div>

    <span className="text-sm md:text-base font-medium">{label}</span>

    {badge && badge > 0 && (
      <span
        className="ml-auto inline-flex items-center justify-center min-w-[24px] h-6 text-xs font-semibold px-2 rounded-full"
        style={{
          backgroundColor: 'var(--theme-accent-primary)',
          color: '#ffffff'
        }}
      >
        {badge}
      </span>
    )}
  </button>
)


export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const [showNewBookingPanel, setShowNewBookingPanel] = useState(false)
  const { data: stats } = useBookingStats()
  const { user } = useAdminAuth()

  // Chiudi il pannello nuova prenotazione quando cambi tab (se necessario)
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Minimalist Professional */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Top Bar: Logo + User Info */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Al Ritrovo</h1>
              <p className="text-gray-600 text-sm mt-1">Dashboard Amministratore</p>
            </div>

            {/* User Badge */}
            <div className="bg-white rounded-modern border-2 border-gray-400 shadow-md hover:shadow-lg hover:border-purple-500 transition-all px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <User className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-gray-900 leading-tight truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-yellow-400 flex items-center justify-center">
                      <Shield className="w-2 h-2 text-yellow-900" />
                    </div>
                    <p className="text-[9px] font-semibold text-gray-600 uppercase">
                      {user?.role === 'admin' ? 'Admin' : 'Staff'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Badges - Griglia 2x2 responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {/* Settimana */}
            <div className="bg-white rounded-modern border-2 border-violet-400 shadow-md hover:shadow-lg hover:border-violet-500 transition-all p-3 flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">Settimana</p>
              <p className="text-2xl font-black text-gray-900 leading-none text-center">
                {stats?.totalWeek || 0}
              </p>
            </div>

            {/* Oggi */}
            <div className="bg-white rounded-modern border-2 border-cyan-400 shadow-md hover:shadow-lg hover:border-cyan-500 transition-all p-3 flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">Oggi</p>
              <p className="text-2xl font-black text-gray-900 leading-none text-center">
                {stats?.totalDay || 0}
              </p>
            </div>

            {/* Mese */}
            <div className="bg-white rounded-modern border-2 border-blue-400 shadow-md hover:shadow-lg hover:border-blue-500 transition-all p-3 flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">Mese</p>
              <p className="text-2xl font-black text-gray-900 leading-none text-center">
                {stats?.totalMonth || 0}
              </p>
            </div>

            {/* Rifiutate */}
            <div className="bg-white rounded-modern border-2 border-rose-400 shadow-md hover:shadow-lg hover:border-rose-500 transition-all p-3 flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">Rifiutate</p>
              <p className="text-2xl font-black text-gray-900 leading-none text-center">
                {stats?.rejected || 0}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-3 md:gap-4">
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
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Statistiche Cards */}
        <div className="space-y-4 mb-8">
          {/* Collapse Card per Inserisci nuova prenotazione */}
          <CollapsibleCard
            title="Inserisci nuova prenotazione"
            subtitle="Crea una nuova prenotazione nel sistema"
            icon={Plus}
            defaultExpanded={false}
            expanded={showNewBookingPanel}
            onExpandedChange={setShowNewBookingPanel}
            headerClassName="bg-al-ritrovo-primary/5 hover:bg-al-ritrovo-primary/10 border-b border-al-ritrovo-primary/20"
          >
            <AdminBookingForm />
          </CollapsibleCard>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 min-h-[600px] border border-gray-200">
          {activeTab === 'calendar' && <BookingCalendarTab />}
          {activeTab === 'pending' && <PendingRequestsTab />}
          {activeTab === 'archive' && <ArchiveTab />}
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
