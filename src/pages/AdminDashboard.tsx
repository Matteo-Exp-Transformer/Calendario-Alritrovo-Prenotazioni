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
    style={{ backgroundColor: '#1A252F' }}
    className={`
      rounded-modern border-2 shadow-lg hover:shadow-xl transition-all
      px-10 py-6
      ${active
        ? 'border-blue-500 scale-105'
        : 'border-gray-400 hover:border-blue-400'
      }
    `}
  >
    <div className="flex items-center gap-5">
      <div className={`
        w-20 h-20 rounded-2xl flex items-center justify-center shadow-md
        ${active
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
          : 'bg-gradient-to-br from-gray-400 to-gray-600'
        }
      `}>
        <Icon className="w-11 h-11 text-white" />
      </div>

      <div className="text-left">
        <span className={`
          text-xl font-bold tracking-wide block
          text-white
        `}>
          {label}
        </span>

        {badge && badge > 0 && (
          <div className="mt-2">
            <span className="inline-flex items-center justify-center min-w-[40px] h-9 bg-gradient-to-br from-red-500 to-rose-600 text-white text-base font-black px-4 rounded-full shadow-md">
              {badge}
            </span>
          </div>
        )}
      </div>
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
          <nav className="flex flex-wrap items-center gap-4 md:gap-6 pb-2">
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
              className="bg-white border-2 border-gray-400 shadow-lg hover:shadow-xl hover:border-purple-500 transition-all rounded-modern"
              headerClassName="hover:bg-gray-50"
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
              className="bg-white border-2 border-gray-400 shadow-lg hover:shadow-xl hover:border-amber-500 transition-all rounded-modern"
              headerClassName="hover:bg-gray-50"
            >
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <PendingRequestsTab />
              </div>
            </CollapsibleCard>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-modern border-2 border-gray-400 shadow-lg hover:shadow-xl transition-all p-8 min-h-[600px] relative">
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
