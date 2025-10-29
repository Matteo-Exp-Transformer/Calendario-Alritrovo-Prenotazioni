import React, { useState } from 'react'
import { AdminHeader } from '@/components/AdminHeader'
import { useBookingStats } from '@/features/booking/hooks/useBookingQueries'
import { PendingRequestsTab } from '@/features/booking/components/PendingRequestsTab'
import { ArchiveTab } from '@/features/booking/components/ArchiveTab'
import { BookingCalendarTab } from '@/features/booking/components/BookingCalendarTab'
import { SettingsTab } from '@/features/booking/components/SettingsTab'
import { AdminBookingForm } from '@/features/booking/components/AdminBookingForm'
import { Calendar, Clock, Archive, Settings, Plus } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'

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
    className="group relative"
  >
    {/* Glow Effect on Active */}
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 rounded-3xl blur-xl opacity-60"></div>
    )}

    <div className={`
      relative flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 rounded-3xl transition-all font-black tracking-wide
      ${active
        ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white shadow-[0_8px_32px_rgba(251,146,60,0.5)] border-2 border-white/50 scale-105'
        : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 hover:scale-105 hover:shadow-lg'
      }
    `}>
      <div className={`
        w-11 h-11 rounded-2xl flex items-center justify-center transition-all
        ${active
          ? 'bg-white/30 shadow-inner'
          : 'bg-white/10 group-hover:bg-white/20'
        }
      `}>
        <Icon className="w-6 h-6 md:w-7 md:h-7 drop-shadow-lg" />
      </div>

      <span className="text-sm md:text-base uppercase tracking-widest drop-shadow-md">{label}</span>

      {badge && badge > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-75"></div>
          <span className="relative inline-flex items-center justify-center min-w-[28px] h-7 bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-black px-2.5 rounded-full shadow-[0_4px_16px_rgba(239,68,68,0.6)] border-2 border-white/50">
            {badge}
          </span>
        </div>
      )}
    </div>
  </button>
)


export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const [showPendingPanel, setShowPendingPanel] = useState(false)
  const [showNewBookingPanel, setShowNewBookingPanel] = useState(false)
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
          <nav className="flex flex-wrap items-center gap-3 md:gap-4 pb-2">
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
              onClick={() => {
                handleTabChange('pending')
                setShowPendingPanel(true)
              }}
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
          <div className="space-y-4 mb-8">
            {/* Collapse Card per Inserisci nuova prenotazione */}
            <CollapsibleCard
              title="Inserisci nuova prenotazione"
              subtitle="Crea una nuova prenotazione nel sistema"
              icon={Plus}
              defaultExpanded={false}
              expanded={showNewBookingPanel}
              onExpandedChange={setShowNewBookingPanel}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-300 shadow-xl"
              headerClassName="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <div className="bg-white rounded-lg">
                <AdminBookingForm />
              </div>
            </CollapsibleCard>

            {/* Collapse Card con Prenotazioni Pendenti */}
            <CollapsibleCard
              title="Prenotazioni Pendenti"
              subtitle={isLoadingStats ? 'Caricamento...' : `${stats?.pending || 0} in attesa`}
              icon={Clock}
              defaultExpanded={false}
              expanded={showPendingPanel}
              onExpandedChange={setShowPendingPanel}
              counter={stats?.pending}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-xl"
              headerClassName="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <PendingRequestsTab />
              </div>
            </CollapsibleCard>
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
