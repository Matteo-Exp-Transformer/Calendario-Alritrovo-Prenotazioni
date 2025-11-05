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
    className={`
      relative flex items-center gap-3 px-4 md:px-6 py-3 rounded-lg transition-all duration-200 border-2 cursor-pointer min-h-[44px]
      ${active
        ? 'bg-white border-al-ritrovo-primary text-al-ritrovo-primary font-semibold shadow-sm'
        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98]'
      }
    `}>
    <div className={`
      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
      ${active
        ? 'bg-al-ritrovo-primary/10'
        : 'bg-gray-100'
      }
    `}>
      <Icon className={`w-5 h-5 ${active ? 'text-al-ritrovo-primary' : 'text-gray-600'}`} />
    </div>

    <span className="text-sm md:text-base font-medium">{label}</span>

    {badge && badge > 0 && (
      <span className="ml-auto inline-flex items-center justify-center min-w-[24px] h-6 bg-al-ritrovo-primary text-white text-xs font-semibold px-2 rounded-full">
        {badge}
      </span>
    )}
  </button>
)


export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calendar')
  const [showNewBookingPanel, setShowNewBookingPanel] = useState(false)
  const { data: stats } = useBookingStats()

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Al Ritrovo</h1>
              <p className="text-gray-600 text-sm mt-1">Dashboard Amministratore</p>
            </div>
            <AdminHeader />
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
              headerClassName="bg-al-ritrovo-primary/5 hover:bg-al-ritrovo-primary/10 border-b border-al-ritrovo-primary/20"
            >
              <AdminBookingForm />
            </CollapsibleCard>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 min-h-[600px] border border-gray-200">
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
